// Define the encyclopedia data structure
export interface EncyclopediaEntry {
  title: string;
  content: string;
  icon?: string;
}

export interface EncyclopediaCategory {
  name: string;
  icon: string;
  description: string;
  entries: EncyclopediaEntry[];
}

// Encyclopedia data
const encyclopediaData: EncyclopediaCategory[] = [
  {
    name: "Medical Emergency Response",
    icon: "🩺",
    description:
      "Wilderness first aid protocols and medical knowledge for survival situations",
    entries: [
      {
        title: "Wilderness First Aid Protocols",
        content: `
          <h3>Basic First Aid Principles</h3>
          <ul>
            <li><strong>Assessment:</strong> Check for danger, responsiveness, airway, breathing, circulation</li>
            <li><strong>Prioritization:</strong> Address life-threatening conditions first (severe bleeding, breathing problems)</li>
            <li><strong>Documentation:</strong> Track vital signs and symptoms when possible</li>
          </ul>
          
          <h3>Common Injuries</h3>
          <ul>
            <li><strong>Cuts and Lacerations:</strong> Clean with purified water, apply pressure to stop bleeding, close with butterfly bandages if available</li>
            <li><strong>Burns:</strong> Cool with clean water, cover with sterile dressing, do not pop blisters</li>
            <li><strong>Fractures:</strong> Immobilize with splints made from rigid materials, pad for comfort</li>
            <li><strong>Sprains:</strong> Rest, Ice (cold compress), Compression, Elevation (RICE)</li>
          </ul>
          
          <h3>Medical Emergencies</h3>
          <ul>
            <li><strong>Heat Exhaustion:</strong> Move to shade, cool with water, rehydrate with electrolytes</li>
            <li><strong>Hypothermia:</strong> Remove wet clothing, warm core first, avoid rapid rewarming</li>
            <li><strong>Dehydration:</strong> Small sips of water, rest in shade, avoid further fluid loss</li>
            <li><strong>Shock:</strong> Lay person flat, elevate legs, maintain body temperature</li>
          </ul>
        `,
      },
      {
        title: "Improvised Medical Tools",
        content: `
          <h3>Bandages and Dressings</h3>
          <ul>
            <li><strong>T-shirt Bandages:</strong> Clean cotton shirts can be cut into strips for bandages</li>
            <li><strong>Moss Dressing:</strong> Clean sphagnum moss has natural antiseptic properties</li>
            <li><strong>Bark Wraps:</strong> Flexible inner bark from certain trees can be used as a wrap</li>
          </ul>
          
          <h3>Splints and Supports</h3>
          <ul>
            <li><strong>Branch Splints:</strong> Straight branches padded with cloth or leaves</li>
            <li><strong>Backpack Frame:</strong> Aluminum frames can be repurposed as leg splints</li>
            <li><strong>Magazine Splint:</strong> Rolled magazines secured with cordage make effective arm splints</li>
          </ul>
          
          <h3>Medical Tools</h3>
          <ul>
            <li><strong>Tweezers:</strong> Split small green sticks and bind at one end</li>
            <li><strong>Suction:</strong> Empty plastic bottle with a small hole can extract venom or debris</li>
            <li><strong>Irrigation Syringe:</strong> Clean water bottle with pinhole in cap</li>
          </ul>
        `,
      },
      {
        title: "Natural Remedies",
        content: `
          <h3>Pain Relief</h3>
          <ul>
            <li><strong>Willow Bark:</strong> Contains salicin (similar to aspirin), chew or make tea for pain relief</li>
            <li><strong>Mint Leaves:</strong> Cooling effect for headaches when applied to forehead</li>
            <li><strong>Clove:</strong> Natural analgesic, especially for toothaches</li>
          </ul>
          
          <h3>Wound Care</h3>
          <ul>
            <li><strong>Honey:</strong> Natural antibacterial properties, apply directly to wounds</li>
            <li><strong>Yarrow:</strong> Helps stop bleeding and has antiseptic properties</li>
            <li><strong>Plantain Leaves:</strong> Anti-inflammatory, can be crushed and applied to wounds</li>
          </ul>
          
          <h3>Digestive Issues</h3>
          <ul>
            <li><strong>Ginger:</strong> Relieves nausea and digestive discomfort</li>
            <li><strong>Charcoal:</strong> Absorbs toxins, can help with food poisoning</li>
            <li><strong>Pine Needle Tea:</strong> Rich in Vitamin C, helps prevent scurvy</li>
          </ul>
        `,
      },
      {
        title: "Triage Decision-Making",
        content: `
          <h3>Triage Categories</h3>
          <ul>
            <li><strong>Immediate:</strong> Life-threatening but treatable injuries</li>
            <li><strong>Delayed:</strong> Serious injuries that can wait for treatment</li>
            <li><strong>Minimal:</strong> Minor injuries that can self-treat or wait</li>
            <li><strong>Expectant:</strong> Unlikely to survive given available resources</li>
          </ul>
          
          <h3>Assessment Factors</h3>
          <ul>
            <li><strong>Resources Available:</strong> Medical supplies, skills, evacuation options</li>
            <li><strong>Time Factors:</strong> Distance to help, weather, daylight remaining</li>
            <li><strong>Group Needs:</strong> Overall group safety vs. individual needs</li>
          </ul>
          
          <h3>Decision Framework</h3>
          <ul>
            <li><strong>Stabilize:</strong> Address immediate life threats</li>
            <li><strong>Assess:</strong> Determine severity and treatment options</li>
            <li><strong>Plan:</strong> Decide on stay-or-go and treatment priorities</li>
            <li><strong>Execute:</strong> Implement treatment and evacuation plan</li>
            <li><strong>Reassess:</strong> Continuously monitor and adjust as needed</li>
          </ul>
        `,
      },
    ],
  },
  {
    name: "Natural Resource Utilization",
    icon: "🌿",
    description:
      "Finding, identifying, and using natural resources for survival",
    entries: [
      {
        title: "Edible & Medicinal Plants",
        content: `
          <h3>Universal Edibility Test</h3>
          <p>When unsure about a plant, follow these steps with a small portion:</p>
          <ol>
            <li>Separate plant parts (leaves, stems, roots)</li>
            <li>Smell for irritating odors</li>
            <li>Place against lip/skin for 15 minutes to check for reaction</li>
            <li>Place tiny piece on tongue for 15 minutes without swallowing</li>
            <li>Chew small amount without swallowing, wait 15 minutes</li>
            <li>Swallow small amount, wait 8 hours for reactions</li>
          </ol>
          
          <h3>Common Edible Plants (North America)</h3>
          <ul>
            <li><strong>Dandelion:</strong> Entirely edible, leaves best when young</li>
            <li><strong>Cattail:</strong> Roots and shoots edible, pollen as flour</li>
            <li><strong>Chicory:</strong> Leaves and roots edible, roots can be coffee substitute</li>
            <li><strong>Clovers:</strong> Flowers and leaves edible raw or cooked</li>
            <li><strong>Amaranth:</strong> Seeds and leaves highly nutritious</li>
          </ul>
          
          <h3>Dangerous Look-alikes</h3>
          <ul>
            <li><strong>Water Hemlock vs. Queen Anne's Lace:</strong> Hemlock has purple spots on stems</li>
            <li><strong>Death Cap Mushrooms vs. Button Mushrooms:</strong> Death caps have white gills</li>
            <li><strong>Poison Ivy vs. Box Elder:</strong> "Leaves of three, let it be"</li>
          </ul>
        `,
      },
      {
        title: "Water Procurement",
        content: `
          <h3>Finding Water Sources</h3>
          <ul>
            <li><strong>Geographic Indicators:</strong> Look for green vegetation, insect swarms, animal trails</li>
            <li><strong>Morning Dew:</strong> Collect with cloth from plants before sunrise</li>
            <li><strong>Dig for Water:</strong> Dig in dry stream beds or low areas</li>
          </ul>
          
          <h3>Collection Methods</h3>
          <ul>
            <li><strong>Solar Still:</strong> Dig hole, place container, cover with plastic sheet</li>
            <li><strong>Transpiration Bag:</strong> Clear bag over leafy branch to collect water vapor</li>
            <li><strong>Rain Catchment:</strong> Tarps or large leaves funneled into containers</li>
            <li><strong>Tree Tap:</strong> Birch and maple trees can be tapped for water</li>
          </ul>
          
          <h3>Purification Techniques</h3>
          <ul>
            <li><strong>Boiling:</strong> Rolling boil for 1-3 minutes (longer at high altitudes)</li>
            <li><strong>Filtration:</strong> Layers of sand, charcoal, and cloth</li>
            <li><strong>Solar Disinfection:</strong> Clear containers in direct sunlight for 6+ hours</li>
            <li><strong>Chemical:</strong> 2 drops of household bleach per liter, wait 30 minutes</li>
          </ul>
        `,
      },
      {
        title: "Hunting & Trapping",
        content: `
          <h3>Simple Traps</h3>
          <ul>
            <li><strong>Figure-4 Deadfall:</strong> Trigger mechanism using sticks and heavy object</li>
            <li><strong>Snare Trap:</strong> Wire or cordage loop that tightens when triggered</li>
            <li><strong>Pit Trap:</strong> Concealed hole with sharpened stakes</li>
            <li><strong>Fish Basket:</strong> Funnel-shaped basket placed in streams</li>
          </ul>
          
          <h3>Improvised Hunting Tools</h3>
          <ul>
            <li><strong>Throwing Stick:</strong> Heavy, curved stick for small game</li>
            <li><strong>Slingshot:</strong> Y-shaped branch with elastic band</li>
            <li><strong>Spear:</strong> Sharpened stick hardened in fire</li>
            <li><strong>Bola:</strong> Weighted cords for entangling prey</li>
          </ul>
          
          <h3>Processing Game</h3>
          <ul>
            <li><strong>Field Dressing:</strong> Remove internal organs promptly</li>
            <li><strong>Skinning:</strong> Small cuts around joints, pull hide away</li>
            <li><strong>Preservation:</strong> Smoking, drying, or salt curing</li>
            <li><strong>Utilizing All Parts:</strong> Bones for tools, hide for cordage/containers</li>
          </ul>
        `,
      },
    ],
  },
  {
    name: "Environmental Interpretation",
    icon: "🧭",
    description: "Reading the environment and navigating without modern tools",
    entries: [
      {
        title: "Weather Prediction",
        content: `
          <h3>Cloud Indicators</h3>
          <ul>
            <li><strong>Cumulus:</strong> Fair weather if small, storms if large and darkening</li>
            <li><strong>Cirrus:</strong> High, thin clouds often indicate weather change in 24 hours</li>
            <li><strong>Nimbostratus:</strong> Dark, low clouds bringing continuous rain</li>
            <li><strong>Mammatus:</strong> Pouch-like clouds often preceding severe storms</li>
          </ul>
          
          <h3>Animal Behavior</h3>
          <ul>
            <li><strong>Birds:</strong> Flying high indicates fair weather, low means approaching storms</li>
            <li><strong>Insects:</strong> Increased activity before rain, disappearing before storms</li>
            <li><strong>Frogs:</strong> Louder croaking often precedes rain</li>
            <li><strong>Livestock:</strong> Restlessness and grouping together before storms</li>
          </ul>
          
          <h3>Natural Signs</h3>
          <ul>
            <li><strong>Red Sky:</strong> "Red sky at night, sailor's delight; red sky in morning, sailor's warning"</li>
            <li><strong>Pinecones:</strong> Open in dry weather, close when humid/rainy</li>
            <li><strong>Leaves:</strong> Showing undersides when wind shifts before storms</li>
            <li><strong>Moon Ring:</strong> Halo around moon indicates moisture and possible precipitation</li>
          </ul>
        `,
      },
      {
        title: "Natural Navigation",
        content: `
          <h3>Celestial Navigation</h3>
          <ul>
            <li><strong>North Star (Polaris):</strong> Located using Big Dipper or Cassiopeia</li>
            <li><strong>Southern Cross:</strong> Points toward south in southern hemisphere</li>
            <li><strong>Sun Position:</strong> East at sunrise, west at sunset; south at noon (northern hemisphere)</li>
            <li><strong>Watch Method:</strong> Point hour hand at sun, halfway between hour hand and 12 is south</li>
          </ul>
          
          <h3>Natural Indicators</h3>
          <ul>
            <li><strong>Tree Growth:</strong> Denser foliage/branches on south side (northern hemisphere)</li>
            <li><strong>Moss Growth:</strong> Often more prevalent on north side of trees/rocks</li>
            <li><strong>Snow Melt:</strong> Faster on south-facing slopes</li>
            <li><strong>Ant Hills:</strong> Often built on south side of trees for warmth</li>
          </ul>
          
          <h3>Landmark Navigation</h3>
          <ul>
            <li><strong>Handrails:</strong> Following linear features like streams or ridgelines</li>
            <li><strong>Catchlines:</strong> Intersecting features that stop travel (roads, rivers)</li>
            <li><strong>Baselines:</strong> Known locations to return to if lost</li>
            <li><strong>Triangulation:</strong> Using three visible landmarks to determine position</li>
          </ul>
        `,
      },
    ],
  },
  {
    name: "Shelter & Protection",
    icon: "🏕️",
    description: "Building shelters and protection systems in the wilderness",
    entries: [
      {
        title: "Emergency Shelters",
        content: `
          <h3>Debris Hut</h3>
          <ul>
            <li><strong>Framework:</strong> Ridge pole supported by two trees/supports</li>
            <li><strong>Ribbing:</strong> Sticks leaned against ridge pole</li>
            <li><strong>Insulation:</strong> Layers of leaves, pine needles, or other debris (6-12 inches)</li>
            <li><strong>Size:</strong> Just large enough for occupants to preserve body heat</li>
          </ul>
          
          <h3>Snow Shelters</h3>
          <ul>
            <li><strong>Snow Cave:</strong> Dug into snowdrift with sleeping platform above entrance</li>
            <li><strong>Quinzhee:</strong> Pile snow, let settle, then hollow out</li>
            <li><strong>Snow Trench:</strong> Dig trench, cover with supports and snow blocks</li>
          </ul>
          
          <h3>Tarp Configurations</h3>
          <ul>
            <li><strong>A-Frame:</strong> Classic ridge line with tarp draped over</li>
            <li><strong>Lean-To:</strong> Single-sided shelter, open face away from wind</li>
            <li><strong>Envelope:</strong> Enclosed design with small entrance</li>
            <li><strong>Mushroom:</strong> Center pole with tarp draped over for 360° protection</li>
          </ul>
        `,
      },
      {
        title: "Fire Making",
        content: `
          <h3>Fire Starting Methods</h3>
          <ul>
            <li><strong>Friction:</strong> Bow drill, hand drill, fire plow</li>
            <li><strong>Spark-Based:</strong> Ferrocerium rod, flint and steel</li>
            <li><strong>Solar:</strong> Magnifying lens, polished can bottom, ice lens</li>
            <li><strong>Chemical:</strong> Potassium permanganate and glycerin</li>
          </ul>
          
          <h3>Tinder Materials</h3>
          <ul>
            <li><strong>Plant-Based:</strong> Cattail fluff, birch bark, dried grass</li>
            <li><strong>Tree-Based:</strong> Cedar bark, pine resin, fatwood shavings</li>
            <li><strong>Nest Materials:</strong> Dry grass, leaves, or bark formed into a nest</li>
            <li><strong>Char Cloth:</strong> Pre-charred natural fiber cloth</li>
          </ul>
          
          <h3>Fire Structures</h3>
          <ul>
            <li><strong>Teepee:</strong> Conical structure, good for initial fires</li>
            <li><strong>Log Cabin:</strong> Stacked perpendicular layers, stable burning</li>
            <li><strong>Dakota Fire Hole:</strong> Underground fire with air intake tunnel</li>
            <li><strong>Star Fire:</strong> Logs arranged like spokes, pushed in as they burn</li>
          </ul>
        `,
      },
    ],
  },
  {
    name: "Psychological Resilience",
    icon: "🧠",
    description: "Mental strategies for survival and crisis situations",
    entries: [
      {
        title: "Stress Management",
        content: `
          <h3>Acute Stress Response</h3>
          <ul>
            <li><strong>Combat Breathing:</strong> 4-count inhale, 4-count hold, 4-count exhale</li>
            <li><strong>Grounding Techniques:</strong> Focus on 5 things you can see, 4 you can touch, etc.</li>
            <li><strong>Cognitive Reframing:</strong> Viewing situation as challenge rather than threat</li>
            <li><strong>Task Breakdown:</strong> Dividing overwhelming situations into manageable steps</li>
          </ul>
          
          <h3>Decision-Making Under Stress</h3>
          <ul>
            <li><strong>STOP Method:</strong> Stop, Think, Observe, Plan</li>
            <li><strong>Rule of 3s:</strong> Prioritize based on survival timeframes (3 minutes without air, 3 hours without shelter, etc.)</li>
            <li><strong>Worst-Case Scenario Planning:</strong> Mentally prepare for negative outcomes</li>
            <li><strong>Decision Points:</strong> Identify key moments requiring critical choices</li>
          </ul>
          
          <h3>Physical Stress Reduction</h3>
          <ul>
            <li><strong>Progressive Muscle Relaxation:</strong> Tensing and releasing muscle groups</li>
            <li><strong>Micro-Rest Periods:</strong> Short breaks during sustained effort</li>
            <li><strong>Hydration/Nutrition:</strong> Maintaining physical resources reduces mental stress</li>
            <li><strong>Sleep Hygiene:</strong> Maximizing quality of limited sleep opportunities</li>
          </ul>
        `,
      },
      {
        title: "Long-term Survival Mindset",
        content: `
          <h3>Psychological Phases</h3>
          <ul>
            <li><strong>Initial Impact:</strong> Shock, disbelief, automatic responses</li>
            <li><strong>Reaction:</strong> Emotional responses, reality setting in</li>
            <li><strong>Coping:</strong> Adaptation to new normal, problem-solving</li>
            <li><strong>Reconstruction:</strong> Long-term adjustment and growth</li>
          </ul>
          
          <h3>Maintaining Hope</h3>
          <ul>
            <li><strong>Goal Setting:</strong> Small, achievable daily objectives</li>
            <li><strong>Ritual Creation:</strong> Establishing routines and ceremonies</li>
            <li><strong>Future Visualization:</strong> Mental imagery of positive outcomes</li>
            <li><strong>Meaning Making:</strong> Finding purpose in survival challenges</li>
          </ul>
          
          <h3>Psychological Tools</h3>
          <ul>
            <li><strong>Mental Rehearsal:</strong> Practicing skills and scenarios mentally</li>
            <li><strong>Positive Self-Talk:</strong> Countering negative thoughts with realistic positives</li>
            <li><strong>Compartmentalization:</strong> Setting aside overwhelming emotions temporarily</li>
            <li><strong>Gratitude Practice:</strong> Acknowledging small positives daily</li>
          </ul>
        `,
      },
    ],
  },
];

export default encyclopediaData;
