import { GeminiService } from './services/geminiService';

async function testGeminiGen() {
  const result = await GeminiService.analyzeAndGenerateNotes({
    questions: [
      { number: 1, text: "Explain Von Neumann Architecture with a block diagram and list its subcomponents.", marks: 10, module: "Module-1" },
      { number: 2, text: "State the difference between Harvard architecture and Von Neumann architecture.", marks: 5, module: "Module-1" }
    ],
    projectTitle: "Computer Organization and Architecture Notes",
    tone: "simple-academic"
  });

  console.log('Result received from Gemini:', result ? 'SUCCESS (Keys: ' + Object.keys(result).join(', ') + ')' : 'FAILED');
}

testGeminiGen();
