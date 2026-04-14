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
    description: 'General practitioners are overloaded but hesitate to trust rapid AI radiological interpretations without specialist verification. Opportunity: Human-in-the-loop AI triage platforms.',
    impact: 'High',
    status: 'Market Gap'
  },
  {
    id: 102,
    category: 'Corporate/Venture',
    target: 'Small Animal',
    title: 'Fragmented Tech Stack Friction',
    description: 'Clinics use 5-7 different apps for scheduling, payroll, and PCR. None talk to each other. Opportunity: A workflow-first "OS for Clinics" that integrates everything.',
    impact: 'Critical',
    status: 'Validated'
  },
  {
    id: 103,
    category: 'Agadham/Local',
    target: 'Cattle & Buffalo',
    title: '9PM - 6AM Emergency Blackout',
    description: 'Zero reliable emergency vet access in rural TN during peak calving hours. High mortality from dystocia. Opportunity: A 24/7 tele-triage + paravet referral network.',
    impact: 'Critical',
    status: 'Validated' 
  }
];

export const INITIAL_POSTS = [
  {
    id: 201,
    type: 'ICAR MCQ',
    title: 'MCQ: Bovine Ketosis Hallmark & Triad',
    performance: 'High Yield (Medicine)',
    status: 'Planned'
  },
  {
    id: 202,
    type: 'Clinical Storytelling',
    title: 'The Case of the "Silent" Choke (Case #104)',
    performance: 'Viral Potential',
    status: 'Planned'
  },
  {
    id: 204,
    type: 'ICAR MCQ',
    title: 'MCQ: MAC Potency & Anaesthesia Monitoring',
    performance: 'High Yield (Surgery)',
    status: 'Planned'
  },
  {
    id: 205,
    type: 'Venture',
    title: 'Revenue: Mobile Clinics vs Fixed Centers 2026',
    performance: 'Strategic',
    status: 'Planned'
  }
];

export const INITIAL_NOTES = [
  {
    id: 301,
    subject: 'Veterinary Medicine',
    title: 'Metabolic: Ketosis Pathophysiology',
    content: 'HALLMARK: Hypoglycemia + Hyperketonemia. Focus on 2026 ICAR: Secondary ketosis is more common than primary. Tx: Glucose + Steroids.',
    isHighYield: true
  },
  {
    id: 302,
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
