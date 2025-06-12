# EVA Business Lookup Web Search Prompts

This document contains the sequence of web search prompts that EVA would use when performing business lookups through the EVABusinessLookupIntegration component.

## 1. Initial Business Entity Search Prompts

### Basic Business Information
```
"[BusinessName] corporation LLC business entity registration [State]"
"[BusinessName] secretary of state filing number [State]"
"[BusinessName] business lookup official records [State]"
"[BusinessName] incorporation date formation [State]"
"[BusinessName] registered agent information [State]"
```

### DBA/Trade Name Searches
```
"[BusinessName] DBA doing business as [DBAName] [State]"
"[DBAName] trade name registration [BusinessName] [State]"
"[BusinessName] fictitious business name [DBAName] [State]"
"[BusinessName] assumed name certificate [State]"
```

### Entity Type Specific
```
"[BusinessName] limited liability company LLC formation [State]"
"[BusinessName] corporation incorporation articles [State]"
"[BusinessName] partnership registration [State]"
"[BusinessName] nonprofit 501c3 status [State]"
"[BusinessName] professional corporation PC [State]"
```

## 2. State Registry and Compliance Searches

### Secretary of State Searches
```
"[State] secretary of state business search [BusinessName]"
"[State] corporations division entity search [BusinessName]"
"[State] business registry online lookup [BusinessName]"
"site:sos.[state].gov [BusinessName]"
"[State] business entity database [BusinessName] status"
```

### Business Status Verification
```
"[BusinessName] good standing certificate [State]"
"[BusinessName] active status verification [State]"
"[BusinessName] business compliance status [State]"
"[BusinessName] suspended dissolved inactive [State]"
"[BusinessName] reinstatement requirements [State]"
```

### Annual Report and Filing Status
```
"[BusinessName] annual report filing status [State] [Year]"
"[BusinessName] biennial statement due date [State]"
"[BusinessName] franchise tax status [State]"
"[BusinessName] periodic report compliance [State]"
```

## 3. Document and Filing Searches

### Formation Documents
```
"[BusinessName] articles of incorporation PDF [State]"
"[BusinessName] certificate of formation download [State]"
"[BusinessName] articles of organization filing [State]"
"[BusinessName] operating agreement public record [State]"
```

### Amendments and Changes
```
"[BusinessName] amended articles filing [State]"
"[BusinessName] name change amendment [State]"
"[BusinessName] registered agent change [State]"
"[BusinessName] business address update filing [State]"
```

### Compliance Documents
```
"[BusinessName] certificate of good standing [State]"
"[BusinessName] tax clearance certificate [State]"
"[BusinessName] certificate of authority foreign [State]"
"[BusinessName] dissolution documents [State]"
```

## 4. Multi-State Operations Searches

### Foreign Entity Registration
```
"[BusinessName] foreign entity registration [State]"
"[BusinessName] certificate of authority [State]"
"[BusinessName] qualified to do business [State]"
"[BusinessName] multi state compliance"
```

### Interstate Business
```
"[BusinessName] registered states multiple jurisdictions"
"[BusinessName] nationwide business registration"
"[BusinessName] interstate commerce filing"
"[BusinessName] state by state registration status"
```

## 5. Business Verification and Validation

### Physical Presence
```
"[BusinessName] principal office address [State]"
"[BusinessName] business location verification"
"[BusinessName] commercial property records [State]"
"[BusinessName] business license [City] [State]"
```

### Ownership and Management
```
"[BusinessName] officers directors public record [State]"
"[BusinessName] ownership structure filing [State]"
"[BusinessName] member manager information LLC [State]"
"[BusinessName] corporate officers annual report [State]"
```

### Business Relationships
```
"[BusinessName] parent company subsidiary [State]"
"[BusinessName] merger acquisition filing [State]"
"[BusinessName] affiliated entities related companies"
"[BusinessName] corporate structure ownership"
```

## 6. Specialized Compliance Searches

### Industry Specific
```
"[BusinessName] professional license verification [State]"
"[BusinessName] regulatory compliance [Industry] [State]"
"[BusinessName] permits licenses active [State]"
"[BusinessName] certification status [Industry]"
```

### Financial and Tax
```
"[BusinessName] EIN employer identification number"
"[BusinessName] state tax ID number [State]"
"[BusinessName] sales tax permit [State]"
"[BusinessName] workers compensation coverage [State]"
```

### Legal and Litigation
```
"[BusinessName] UCC filing lien search [State]"
"[BusinessName] judgment lien records [State]"
"[BusinessName] bankruptcy filing check"
"[BusinessName] legal entity status verification"
```

## 7. Enhanced Search Strategies

### Deep Web Searches
```
"inurl:business-search [BusinessName] [State]"
"intitle:entity-details [BusinessName] [State]"
"filetype:pdf [BusinessName] certificate [State]"
"cache:sos.[state].gov [BusinessName]"
```

### Alternative Data Sources
```
"[BusinessName] opencorporates profile"
"[BusinessName] bloomberg company profile"
"[BusinessName] dun bradstreet DUNS number"
"[BusinessName] better business bureau profile"
```

### Historical Searches
```
"[BusinessName] historical filings archive [State]"
"[BusinessName] name history changes [State]"
"[BusinessName] previous addresses registered [State]"
"[BusinessName] corporate history timeline"
```

## 8. Error Recovery Searches

### Name Variations
```
"[BusinessName without punctuation] [State]"
"[BusinessName abbreviated] [State]"
"[BusinessName common misspelling] [State]"
"[BusinessName phonetic spelling] [State]"
```

### Partial Matches
```
"businesses starting with [First few letters] [State]"
"*[PartialName]* business entity [State]"
"similar to [BusinessName] registered [State]"
```

## Usage Notes for EVA

1. **Progressive Enhancement**: Start with basic searches and progressively add more specific queries based on initial results.

2. **State-Specific Formats**: Adapt search queries to match each state's specific terminology (e.g., some states use "Certificate of Formation" while others use "Articles of Organization").

3. **Temporal Searches**: Include year ranges for historical searches when looking for older businesses.

4. **Domain-Specific Searches**: Use site: operators for official government domains when available.

5. **Fallback Strategies**: If direct searches fail, use broader terms and filter results programmatically.

6. **Compliance Context**: Always search for current compliance status along with basic information.

7. **Document Verification**: Cross-reference multiple sources to verify document authenticity.

8. **Multi-State Coordination**: When searching multiple states, aggregate results to identify the primary state of incorporation.

## Integration with EVA Conversation

After gathering results, EVA should:
- Summarize findings in a conversational format
- Highlight any compliance issues or concerns
- Suggest next steps based on the business status
- Provide context about what the findings mean for the user's specific needs
- Offer to search additional states or retrieve specific documents

This comprehensive search strategy ensures EVA can provide thorough business intelligence while maintaining a helpful, conversational interface.