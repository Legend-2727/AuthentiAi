// Test file to check exports
import fs from 'fs';

const content = fs.readFileSync('./src/hooks/useFeed.ts', 'utf8');
console.log('File content length:', content.length);
console.log('Contains useComments export:', content.includes('export const useComments'));
console.log('Last 500 characters:');
console.log(content.slice(-500));
