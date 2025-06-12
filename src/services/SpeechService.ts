import { debugLog } from '../utils/auditLogger';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: {
    transcript: string;
    confidence: number;
  }[];
}

export interface SpeechSynthesisOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

export interface SpeechProvider {
  name: string;
  supported: boolean;
  features: {
    recognition: boolean;
    synthesis: boolean;
    realtime: boolean;
    languages: string[];
  };
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  // Callbacks
  private onResult: ((result: SpeechRecognitionResult) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private onStart: (() => void) | null = null;
  private onEnd: (() => void) | null = null;

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  private initializeSpeechRecognition(): void {
    // Check for browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognitionSettings();
      this.setupRecognitionEvents();
    }
  }

  private setupRecognitionSettings(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;
  }

  private setupRecognitionEvents(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      debugLog('general', 'log_statement', 'Speech recognition started')
      this.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];

      if (lastResult) {
        const result: SpeechRecognitionResult = {
          transcript: lastResult[0].transcript,
          confidence: lastResult[0].confidence,
          isFinal: lastResult.isFinal,
          alternatives: Array.from(lastResult)
            .slice(1)
            .map(alt => ({
              transcript: alt.transcript,
              confidence: alt.confidence,
            })),
        };

        this.onResult?.(result);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      debugLog('general', 'log_statement', 'Speech recognition ended')
      this.onEnd?.();
    };
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  // Public API Methods

  startListening(callbacks?: {
    onResult?: (result: SpeechRecognitionResult) => void;
    onError?: (error: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
  }): boolean {
    if (!this.recognition) {
      console.error('Speech recognition not supported in this browser');
      return false;
    }

    if (this.isListening) {
      console.warn('Speech recognition is already active');
      return false;
    }

    // Set callbacks
    if (callbacks) {
      this.onResult = callbacks.onResult || null;
      this.onError = callbacks.onError || null;
      this.onStart = callbacks.onStart || null;
      this.onEnd = callbacks.onEnd || null;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.onError?.('Failed to start speech recognition');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  speak(text: string, options?: SpeechSynthesisOptions): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported in this browser'));
        return;
      }

      // Cancel any current speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Apply options
      if (options) {
        if (options.rate !== undefined) utterance.rate = options.rate;
        if (options.pitch !== undefined) utterance.pitch = options.pitch;
        if (options.volume !== undefined) utterance.volume = options.volume;
        if (options.language) utterance.lang = options.language;

        if (options.voice) {
          const voices = this.synthesis.getVoices();
          const selectedVoice = voices.find(
            voice => voice.name === options.voice || voice.voiceURI === options.voice,
          );
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve(true);
      };

      utterance.onerror = error => {
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${error.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  getAvailableLanguages(): string[] {
    const voices = this.getVoices();
    const languages = new Set(voices.map(voice => voice.lang));
    return Array.from(languages).sort();
  }

  getSupportedProviders(): SpeechProvider[] {
    const providers: SpeechProvider[] = [];

    // Web Speech API
    providers.push({
      name: 'Web Speech API',
      supported: !!(this.recognition || this.synthesis),
      features: {
        recognition: !!this.recognition,
        synthesis: !!this.synthesis,
        realtime: true,
        languages: this.getAvailableLanguages(),
      },
    });

    return providers;
  }

  // Utility methods for financial applications

  async transcribeFinancialData(audioBlob: Blob): Promise<{
    transcript: string;
    extractedNumbers: number[];
    extractedDates: Date[];
    confidence: number;
  }> {
    // Convert blob to text using Web Speech API or cloud service
    const transcript = await this.transcribeAudioBlob(audioBlob);

    // Extract financial data patterns
    const numbers = this.extractNumbers(transcript);
    const dates = this.extractDates(transcript);

    return {
      transcript,
      extractedNumbers: numbers,
      extractedDates: dates,
      confidence: 0.85, // Placeholder confidence score
    };
  }

  async speakFinancialData(data: {
    customerName?: string;
    loanAmount?: number;
    interestRate?: number;
    term?: number;
    monthlyPayment?: number;
  }): Promise<void> {
    const text = this.formatFinancialDataForSpeech(data);
    await this.speak(text, {
      rate: 0.9, // Slightly slower for financial data
      language: 'en-US',
    });
  }

  private async transcribeAudioBlob(blob: Blob): Promise<string> {
    // For now, return a placeholder
    // In a real implementation, this would use a cloud speech service
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('Placeholder transcription of audio blob');
      }, 1000);
    });
  }

  private extractNumbers(text: string): number[] {
    const numberPattern = /\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b/g;
    const matches = text.match(numberPattern) || [];
    return matches.map(match => parseFloat(match.replace(/,/g, '')));
  }

  private extractDates(text: string): Date[] {
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // MM/DD/YYYY
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g, // MM-DD-YYYY
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    ];

    const dates: Date[] = [];
    datePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const date = new Date(match);
        if (!isNaN(date.getTime())) {
          dates.push(date);
        }
      });
    });

    return dates;
  }

  private formatFinancialDataForSpeech(data: {
    customerName?: string;
    loanAmount?: number;
    interestRate?: number;
    term?: number;
    monthlyPayment?: number;
  }): string {
    let text = '';

    if (data.customerName) {
      text += `Loan details for ${data.customerName}. `;
    }

    if (data.loanAmount) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(data.loanAmount);
      text += `Loan amount: ${formattedAmount}. `;
    }

    if (data.interestRate) {
      text += `Interest rate: ${data.interestRate} percent. `;
    }

    if (data.term) {
      text += `Term: ${data.term} months. `;
    }

    if (data.monthlyPayment) {
      const formattedPayment = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(data.monthlyPayment);
      text += `Monthly payment: ${formattedPayment}.`;
    }

    return text;
  }

  // Advanced features for EVA integration

  async processVoiceCommand(command: string): Promise<{
    action: string;
    parameters: any;
    confidence: number;
  }> {
    // AI-powered voice command processing
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('send credit application')) {
      return {
        action: 'SEND_CREDIT_APPLICATION',
        parameters: this.extractCustomerFromCommand(command),
        confidence: 0.9,
      };
    }

    if (lowerCommand.includes('pull credit') || lowerCommand.includes('background check')) {
      return {
        action: 'PULL_CREDIT_BACKGROUND',
        parameters: this.extractCustomerFromCommand(command),
        confidence: 0.85,
      };
    }

    if (lowerCommand.includes('analyze cash flow') || lowerCommand.includes('bank statements')) {
      return {
        action: 'ANALYZE_CASHFLOW',
        parameters: this.extractCustomerFromCommand(command),
        confidence: 0.8,
      };
    }

    if (lowerCommand.includes('calculate') && lowerCommand.includes('ratio')) {
      return {
        action: 'CALCULATE_FINANCIAL_RATIOS',
        parameters: this.extractCustomerFromCommand(command),
        confidence: 0.75,
      };
    }

    return {
      action: 'UNKNOWN',
      parameters: {},
      confidence: 0.1,
    };
  }

  private extractCustomerFromCommand(command: string): { customerName?: string } {
    // Extract customer name from voice command
    const namePattern = /for\s+([A-Za-z\s]+)/i;
    const match = command.match(namePattern);

    if (match && match[1]) {
      return { customerName: match[1].trim() };
    }

    return {};
  }

  // Cleanup method
  dispose(): void {
    this.stopListening();
    this.stopSpeaking();
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;
  }
}

export const speechService = new SpeechService();
