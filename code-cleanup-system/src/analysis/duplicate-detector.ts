import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

import { debugLog } from '../utils/auditLogger';

interface CodeBlock {
  file: string;
  startLine: number;
  endLine: number;
  content: string;
  hash: string;
  ast?: any;
  complexity: number;
  type: 'function' | 'class' | 'component' | 'block' | 'import';
}

interface DuplicateGroup {
  hash: string;
  blocks: CodeBlock[];
  similarity: number;
  potentialSavings: {
    lines: number;
    bytes: number;
    complexity: number;
  };
  risk: 'low' | 'medium' | 'high';
  recommendation: string;
}

export class DuplicateDetector {
  private codeBlocks: Map<string, CodeBlock[]> = new Map();
  private functionSignatures: Map<string, CodeBlock[]> = new Map();
  private deadCode: CodeBlock[] = [];

  constructor(private projectRoot: string) {}

  /**
   * Main analysis entry point
   */
  async analyze(): Promise<{
    duplicates: DuplicateGroup[];
    deadCode: CodeBlock[];
    redundantImports: Map<string, string[]>;
    unusedComponents: string[];
    metrics: AnalysisMetrics;
  }> {
    debugLog('general', 'log_statement', '🔍 Starting deep code analysis...')

    // Phase 1: Collect all code blocks
    await this.collectCodeBlocks();

    // Phase 2: Detect exact duplicates
    const exactDuplicates = this.findExactDuplicates();

    // Phase 3: Detect similar code (fuzzy matching)
    const similarCode = await this.findSimilarCode();

    // Phase 4: Detect dead code
    await this.findDeadCode();

    // Phase 5: Analyze imports
    const redundantImports = this.analyzeImports();

    // Phase 6: Find unused components
    const unusedComponents = this.findUnusedComponents();

    // Phase 7: Calculate metrics
    const metrics = this.calculateMetrics();

    return {
      duplicates: [...exactDuplicates, ...similarCode],
      deadCode: this.deadCode,
      redundantImports,
      unusedComponents,
      metrics
    };
  }

  /**
   * Collect all code blocks from the project
   */
  private async collectCodeBlocks(): Promise<void> {
    const files = this.getAllTypeScriptFiles(this.projectRoot);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const ast = parser.parse(content, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx', 'decorators-legacy']
        });

        // Extract functions, classes, and components
        traverse(ast, {
          FunctionDeclaration: (path) => {
            this.extractCodeBlock(file, path.node, content, 'function');
          },
          ArrowFunctionExpression: (path) => {
            if (path.parent.type === 'VariableDeclarator') {
              this.extractCodeBlock(file, path.node, content, 'function');
            }
          },
          ClassDeclaration: (path) => {
            this.extractCodeBlock(file, path.node, content, 'class');
          },
          ImportDeclaration: (path) => {
            this.trackImport(file, path.node);
          },
          JSXElement: (path) => {
            this.trackComponentUsage(file, path.node);
          }
        });
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error);
      }
    }
  }

  /**
   * Extract a code block and calculate its properties
   */
  private extractCodeBlock(
    file: string,
    node: any,
    content: string,
    type: CodeBlock['type']
  ): void {
    const startLine = node.loc?.start.line || 0;
    const endLine = node.loc?.end.line || 0;
    const blockContent = content.split('\n').slice(startLine - 1, endLine).join('\n');

    const block: CodeBlock = {
      file,
      startLine,
      endLine,
      content: blockContent,
      hash: this.hashCode(this.normalizeCode(blockContent)),
      ast: node,
      complexity: this.calculateComplexity(node),
      type
    };

    // Store by hash for duplicate detection
    if (!this.codeBlocks.has(block.hash)) {
      this.codeBlocks.set(block.hash, []);
    }
    this.codeBlocks.get(block.hash)!.push(block);

    // Store function signatures for similarity detection
    if (type === 'function') {
      const signature = this.extractFunctionSignature(node);
      if (!this.functionSignatures.has(signature)) {
        this.functionSignatures.set(signature, []);
      }
      this.functionSignatures.get(signature)!.push(block);
    }
  }

  /**
   * Find exact duplicate code blocks
   */
  private findExactDuplicates(): DuplicateGroup[] {
    const duplicates: DuplicateGroup[] = [];

    for (const [hash, blocks] of this.codeBlocks) {
      if (blocks.length > 1) {
        const totalLines = blocks.reduce((sum, b) => sum + (b.endLine - b.startLine + 1), 0);
        const totalBytes = blocks.reduce((sum, b) => sum + b.content.length, 0);
        const avgComplexity = blocks.reduce((sum, b) => sum + b.complexity, 0) / blocks.length;

        duplicates.push({
          hash,
          blocks,
          similarity: 100,
          potentialSavings: {
            lines: totalLines - (blocks[0].endLine - blocks[0].startLine + 1),
            bytes: totalBytes - blocks[0].content.length,
            complexity: avgComplexity * (blocks.length - 1)
          },
          risk: this.assessRisk(blocks),
          recommendation: this.generateRecommendation(blocks)
        });
      }
    }

    return duplicates;
  }

  /**
   * Find similar code using fuzzy matching
   */
  private async findSimilarCode(): Promise<DuplicateGroup[]> {
    const similar: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (const blocks of this.functionSignatures.values()) {
      for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
          const key = `${blocks[i].hash}-${blocks[j].hash}`;
          if (processed.has(key)) continue;
          processed.add(key);

          const similarity = this.calculateSimilarity(blocks[i], blocks[j]);
          if (similarity > 70 && similarity < 100) {
            similar.push({
              hash: key,
              blocks: [blocks[i], blocks[j]],
              similarity,
              potentialSavings: this.calculatePotentialSavings([blocks[i], blocks[j]]),
              risk: this.assessRisk([blocks[i], blocks[j]]),
              recommendation: `Consider merging these similar functions (${similarity}% similar)`
            });
          }
        }
      }
    }

    return similar;
  }

  /**
   * Find dead code (unreferenced functions/components)
   */
  private async findDeadCode(): Promise<void> {
    // Implementation for finding dead code
    // This would involve building a reference graph and finding unreachable nodes
  }

  /**
   * Calculate code similarity using AST comparison
   */
  private calculateSimilarity(block1: CodeBlock, block2: CodeBlock): number {
    // Simplified similarity calculation
    // In a real implementation, this would use more sophisticated algorithms
    const tokens1 = this.tokenize(block1.content);
    const tokens2 = this.tokenize(block2.content);

    const commonTokens = tokens1.filter(t => tokens2.includes(t)).length;
    const totalTokens = Math.max(tokens1.length, tokens2.length);

    return Math.round((commonTokens / totalTokens) * 100);
  }

  /**
   * Helper methods
   */
  private normalizeCode(code: string): string {
    return code
      .replace(/\s+/g, ' ')
      .replace(/['"`]/g, '"')
      .trim();
  }

  private hashCode(code: string): string {
    return createHash('md5').update(code).digest('hex');
  }

  private calculateComplexity(node: any): number {
    let complexity = 1;

    traverse(node, {
      IfStatement: () => complexity++,
      ConditionalExpression: () => complexity++,
      LogicalExpression: (path) => {
        if (path.node.operator === '&&' || path.node.operator === '||') {
          complexity++;
        }
      },
      ForStatement: () => complexity++,
      WhileStatement: () => complexity++,
      DoWhileStatement: () => complexity++,
      SwitchCase: () => complexity++
    });

    return complexity;
  }

  private tokenize(code: string): string[] {
    return code.match(/\b\w+\b/g) || [];
  }

  private getAllTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir);

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !entry.includes('node_modules') && !entry.startsWith('.')) {
          walk(fullPath);
        } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  private assessRisk(blocks: CodeBlock[]): 'low' | 'medium' | 'high' {
    const avgComplexity = blocks.reduce((sum, b) => sum + b.complexity, 0) / blocks.length;
    const isInTestFile = blocks.some(b => b.file.includes('.test.') || b.file.includes('.spec.'));
    const isInCriticalPath = blocks.some(b =>
      b.file.includes('auth') ||
      b.file.includes('payment') ||
      b.file.includes('core')
    );

    if (isInCriticalPath) return 'high';
    if (avgComplexity > 10 || !isInTestFile) return 'medium';
    return 'low';
  }

  private generateRecommendation(blocks: CodeBlock[]): string {
    if (blocks.every(b => b.type === 'import')) {
      return 'Consolidate duplicate imports';
    }

    if (blocks.every(b => b.type === 'function' && b.complexity < 3)) {
      return 'Extract to shared utility function';
    }

    if (blocks.some(b => b.type === 'component')) {
      return 'Create reusable component';
    }

    return 'Review and consolidate duplicate logic';
  }

  private trackImport(_file: string, _node: any): void {
    // Track import usage
  }

  private trackComponentUsage(_file: string, _node: any): void {
    // Track component usage
  }

  private analyzeImports(): Map<string, string[]> {
    // Analyze and return redundant imports
    return new Map();
  }

  private findUnusedComponents(): string[] {
    // Find and return unused components
    return [];
  }

  private calculateMetrics(): AnalysisMetrics {
    return {
      totalFiles: 0,
      totalLines: 0,
      duplicateLines: 0,
      deadCodeLines: 0,
      averageComplexity: 0,
      estimatedSavings: {
        lines: 0,
        bytes: 0,
        percentage: 0
      }
    };
  }

  private extractFunctionSignature(_node: any): string {
    // Extract function signature for similarity matching
    return '';
  }

  private calculatePotentialSavings(_blocks: CodeBlock[]): any {
    return {
      lines: 0,
      bytes: 0,
      complexity: 0
    };
  }
}

interface AnalysisMetrics {
  totalFiles: number;
  totalLines: number;
  duplicateLines: number;
  deadCodeLines: number;
  averageComplexity: number;
  estimatedSavings: {
    lines: number;
    bytes: number;
    percentage: number;
  };
}
