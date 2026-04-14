/**
 * Intelligence Ingestion Engine
 * Seeding the Personal OS with high-priority startup and clinical intel.
 */

export const INITIAL_PROBLEMS = [
  {
    id: 101,
    category: 'Corporate/Venture',
    target: 'Small Animal',
    title: 'Diagnostic AI Trust Gap',
    desc: 'General practitioners are overloaded but hesitate to trust rapid AI radiological interpretations without specialist verification. Opportunity: Human-in-the-loop AI triage platforms.',
    impact: 'High',
    status: 'Market Gap'
  },
  {
    id: 102,
    category: 'Corporate/Venture',
    target: 'Small Animal',
    title: 'Fragmented Tech Stack Friction',
    desc: 'Clinics use 5-7 different apps for scheduling, payroll, and PCR. None talk to each other. Opportunity: A workflow-first "OS for Clinics" that integrates everything.',
    impact: 'Critical',
    status: 'Validated'
  },
  {
    id: 103,
    category: 'Agadham/Local',
    target: 'Cattle & Buffalo',
    title: '9PM - 6AM Emergency Blackout',
    desc: 'Zero reliable emergency vet access in rural TN during peak calving hours. High mortality from dystocia. Opportunity: A 24/7 tele-triage + paravet referral network.',
    impact: 'Critical',
    status: 'Field Observation'
  },
  {
    id: 104,
    category: 'Agadham/Local',
    target: 'Cattle & Buffalo',
    title: 'Maatu Doctor Truth Gap',
    desc: 'Farmers rely on outdated traditional practices for complex infectious diseases, leading to late stage presentations. Opportunity: Direct-to-farmer scientific content brand.',
    impact: 'Medium',
    status: 'Content Gap'
  }
];

export const INITIAL_POSTS = [
  {
    id: 201,
    type: 'ICAR MCQ',
    title: 'MCQ: Bovine Ketosis Hallmark',
    performance: '',
    status: 'Planned'
  },
  {
    id: 202,
    type: 'Clinical Storytelling',
    title: 'The "Invisible" Choke: A Case Study',
    performance: '',
    status: 'Planned'
  },
  {
    id: 203,
    type: 'Agadham',
    title: 'Why Rural TN needs 24/7 Vets',
    performance: '',
    status: 'Planned'
  },
  {
    id: 204,
    type: 'ICAR MCQ',
    title: 'MCQ: Milk Fever Stages',
    performance: '',
    status: 'Planned'
  },
  {
    id: 205,
    type: 'ICAR MCQ',
    title: 'MCQ: Suture Tensile Strength',
    performance: '',
    status: 'Planned'
  },
  {
    id: 206,
    type: 'ICAR MCQ',
    title: 'MCQ: Therapeutic Index Logic',
    performance: '',
    status: 'Planned'
  }
];

export const INITIAL_NOTES = [
  {
    id: 301,
    subject: 'Veterinary Medicine',
    title: 'Bovine Dystocia Protocol (High-Yield)',
    content: '1. Immediate Vaginal Exam. 2. Correct fetal posture (Head/Legs). 3. Use of lubes. 4. C-section trigger points if no progress in 30 mins.'
  },
  {
    id: 302,
    subject: 'Veterinary Pharmacology',
    title: 'Emergency Drug Dosages (SA)',
    content: 'Epinephrine: 0.1 ml/kg of 1:1000. Atropine: 0.04 mg/kg. Keep ready in crash cart for corporate hospital standards.'
  }
];

export function runIntelligenceIngest(store: any) {
  // Only ingest if the store is effectively empty to avoid duplication
  if (store.problems.length <= 1) { // 1 accounts for the default sample if present
    INITIAL_PROBLEMS.forEach(p => store.addProblem(p));
  }
  
  if (store.posts.length <= 1) {
    INITIAL_POSTS.forEach(p => store.addPost(p));
  }
  
  if (store.notes.length === 0) {
    INITIAL_NOTES.forEach(n => store.addNote(n));
  }

  // Also seed the general activity feed with these captures
  if (store.activities.length === 0) {
    store.addActivity({
      id: 401,
      type: 'idea',
      title: 'Venture Opportunity: AI Triage',
      content: 'Ingested intelligence on Small Animal Corporate Tech Gaps.',
      tag: 'Venture',
      created_at: new Date().toISOString()
    });
    store.addActivity({
      id: 402,
      type: 'note',
      title: 'Study Seed: Bovine Dystocia',
      content: 'High-yield clinical protocol added to Study Zone.',
      tag: 'Study',
      created_at: new Date().toISOString()
    });
  }
}
