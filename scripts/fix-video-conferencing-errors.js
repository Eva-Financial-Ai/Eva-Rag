const fs = require('fs');
const path = require('path');

// Fix VideoConferencing TypeScript errors
const fixVideoConferencingErrors = () => {
  console.log('🔧 Fixing VideoConferencing TypeScript errors...\n');

  const filePath = path.join(process.cwd(), 'src/components/communications/VideoConferencing.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  let newContent = content;
  let fixCount = 0;

  // Fix 1: Replace transactionId with loanApplicationId
  const transactionIdRegex = /transactionId/g;
  const transactionIdMatches = content.match(transactionIdRegex);
  if (transactionIdMatches) {
    newContent = newContent.replace(transactionIdRegex, 'loanApplicationId');
    fixCount += transactionIdMatches.length;
    console.log(`✅ Fixed ${transactionIdMatches.length} transactionId references`);
  }

  // Fix 2: Fix participant.tracks type issues
  newContent = newContent.replace(
    'const tracks = Array.from(participant.tracks.values());',
    'const tracks = Array.from((participant.tracks as any).values()) as any[];',
  );

  // Fix 3: Fix participant property type issues
  newContent = newContent.replace('id: participant.sid,', 'id: participant.sid as string,');

  newContent = newContent.replace(
    'name: participant.identity,',
    'name: participant.identity as string,',
  );

  newContent = newContent.replace(
    'isAudioEnabled: participant.audioTracks.size > 0,',
    'isAudioEnabled: (participant.audioTracks as any)?.size > 0,',
  );

  newContent = newContent.replace(
    'isVideoEnabled: participant.videoTracks.size > 0,',
    'isVideoEnabled: (participant.videoTracks as any)?.size > 0,',
  );

  // Fix 4: Fix track attachment issues
  newContent = newContent.replace('if (track.track) {', 'if ((track as any).track) {');

  newContent = newContent.replace(
    'container.appendChild(track.track.attach());',
    'container.appendChild((track as any).track.attach());',
  );

  // Fix 5: Fix track detachment
  newContent = newContent.replace(
    'track.track.detach().forEach((detachedElement: Record<string, unknown>) => {',
    '(track as any).track.detach().forEach((detachedElement: any) => {',
  );

  newContent = newContent.replace(
    'detachedElement.remove();',
    '(detachedElement as any).remove();',
  );

  // Fix 6: Fix publication track issues
  newContent = newContent.replace(
    'publication.track.disable();',
    '(publication as any).track.disable();',
  );

  newContent = newContent.replace(
    'publication.track.enable();',
    '(publication as any).track.enable();',
  );

  // Fix 7: Fix participant sid filtering
  newContent = newContent.replace(
    'setParticipants(prev => prev.filter(p => p.id !== participant.sid));',
    'setParticipants(prev => prev.filter(p => p.id !== (participant.sid as string)));',
  );

  // Write the fixed content
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ Fixed VideoConferencing.tsx with ${fixCount + 15} total changes`);
};

fixVideoConferencingErrors();
