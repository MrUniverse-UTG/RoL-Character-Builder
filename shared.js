
// ═══════════════════════════════════════════════════════════════
// GAME DATA
// ═══════════════════════════════════════════════════════════════
// Point buy system — no arrays needed
const POINT_BUY_TOTAL = 7;
const POINT_BUY_MAX = 3;


const ATTRIBUTES = [
  {key:'STR', name:'Strength',  desc:'Athletic power, fortitude, physical force'},
  {key:'AGI', name:'Agility',   desc:'Motor skills, reflexes, speed'},
  {key:'WIT', name:'Wits',      desc:'Critical thinking, perception, analysis'},
  {key:'EMP', name:'Empathy',   desc:'Understanding others, communication, intuition'},
];

const SKILLS = {
  STR: [{key:'Brawl',      name:'Brawl'},     {key:'Might',      name:'Might'},
        {key:'Endure',     name:'Endure'},    {key:'Intimidate', name:'Intimidate'}],
  AGI: [{key:'Move',       name:'Move'},      {key:'Hide',       name:'Hide'},
        {key:'Finesse',    name:'Finesse'},   {key:'Shoot',      name:'Shoot'}],
  WIT: [{key:'Analyze',    name:'Analyze'},   {key:'Scout',      name:'Scout'},
        {key:'Insight',    name:'Insight'},   {key:'Survival',   name:'Survival'}],
  EMP: [{key:'Manipulate', name:'Manipulate'},{key:'Perform',    name:'Perform'},
        {key:'Medical',    name:'Medical'},   {key:'Tame',       name:'Tame'}],
};

const LINEAGES = [
  {name:'Abysian', type:'Traditional', size:'Medium', speed:30, height:"5'–8'",
   langs:{speak:['Sybus','Gaian'], read:['Sybus','Gaian']},
   desc:'Feline Humanoids that are mobile and sturdy. Mature at 30, live to ~150.',
   traits:['Highlander','Kogon'],
   traitDetails:{
     Highlander:{
       label:'Highlander',
       desc:'These nimble Abysians have more Humanoid features and physiology in their face and limbs.',
       major:{name:'Catlike Reflexes',text:'You can use a Quick action to move up to 15 feet without provoking Opportunity Strikes. You cannot use this trait more than once in a round.'},
       minor:{name:'Mountain Climber',text:'Gain a Climb Speed equal to your base Speed.'},
     },
     Kogon:{
       label:'Kogon',
       desc:'These thicker Abysians have a more feline-like physiology in their faces and limbs.',
       major:{name:'For the Hunt',text:'You can use a Quick action to move up to 30 feet until the end of your turn. You cannot use this trait more than once in a round.'},
       minor:{name:'Stubborn',text:'When you start your turn with 0 HP, you can use this trait to regain up to 12 HP. You cannot use this trait again until you finish an Intermission.'},
     },
   },
   features:'Choose a sub-group below.'},

  {name:'Dryvorn', type:'Traditional', size:'Medium', speed:30, height:"4'–7'",
   langs:{speak:['Draconic','Gaian'], read:['Draconic','Gaian']},
   desc:'Dragon-blessed Humanoids attuned to a special element. Mature at 19, live to ~135.',
   traits:['Dragon Bloodline'],
   major:{name:'Dragon Breath',text:'You can spend a Standard action and three Sorce Points to exhale a 15-foot cone or 30-foot line breath attack. The damage type is dependent on your Dragon Bloodline. The breath deals 12 damage. Creatures hit can make a Move save to reduce damage.'},
   minor:{name:'Dragon Resistance',text:'Your HP gains resistance to the damage type associated with your Dragon Bloodline.'},
   features:`Dragon Breath (Major Trait): You can spend a Standard action and three Sorce Points to exhale a 15-foot cone or 30-foot line breath attack. The damage type is dependent on your Dragon Bloodline. The breath deals 12 damage. Creatures hit can make a Move save to reduce damage.

Dragon Resistance (Minor Trait): Your HP gains resistance to the damage type associated with your Dragon Bloodline.

Dragon Bloodlines - choose one: Ravano (Red, Fire) | Golgun (Green, Acid) | Voivern (Black, Necrotic) | Sargon (Yellow, Radiant) | Byvern (White, Frost) | Thundron (Blue, Electric)`},

  {name:'Fueglins', type:'Traditional', size:'Small', speed:30, height:"3'–4'",
   langs:{speak:['Fuegi','Gaian'], read:['Sylvan','Gaian']},
   desc:'Small fungus people who can consume corpses to gain memories. Mature at 10, live to ~80.',
   traits:['Fueglin'],
   major:{name:'Small and Nimble',text:'When you make a Move save and fail, you can use this trait to gain 1 success. You cannot use this trait on a Pushed check. Once you use this trait, you cannot use it again until you finish an Intermission.'},
   minor:{name:'Taste of the Past',text:'You gain a +2 modifier on Endure checks against Poisons or Diseases from contaminated meat. When near a corpse, consume a part to gain one memory of the creature. You can pick a time and day; the GM determines what is revealed. Once used three times, you must finish a Light or Full Rest before using again.'},
   features:`Small and Nimble (Major Trait): When you make a Move save and fail, you can use this trait to gain 1 success. You cannot use this trait on a Pushed check. Once you use this trait, you cannot use it again until you finish an Intermission.

Taste of the Past (Minor Trait): You gain a +2 modifier on Endure checks against Poisons or Diseases gained from eating contaminated meat. When near a corpse, consume a part to gain one memory of the creature. Once used three times, finish a Light or Full Rest before using again.`},

  {name:'Guodons', type:'Traditional', size:'Medium', speed:30, height:"6'–8'",
   langs:{speak:['Godun','Gaian'], read:['Eldar','Gaian']},
   desc:'Sturdy Humanoids whose bloodline was blessed by the Titans of Gaia. Mature at 20, live to ~120.',
   traits:['Guodon'],
   major:{name:'Titan Blood',text:'When calculating the weight you can push, pull, and lift, add 50 pounds. When Grappling or Shoving another creature, you can treat yourself as one size bigger. You cannot use this trait to Grapple or Shove Gargantuan or larger creatures.'},
   minor:{name:'Thick Build',text:'You can wield heavy weapons and shields in one hand but cannot wield more than one at once.'},
   features:`Titan Blood (Major Trait): When calculating the weight you can push, pull, and lift, add 50 pounds. When Grappling or Shoving another creature, you can treat yourself as one size bigger. You cannot use this trait to Grapple or Shove Gargantuan or larger creatures.

Thick Build (Minor Trait): You can wield heavy weapons and shields in one hand but cannot wield more than one at once.`},

  {name:'Humans', type:'Traditional', size:'Small or Medium', speed:30, height:"3'–6'",
   langs:{speak:['Hunon','Gaian'], read:['Aquon','Gaian']},
   desc:'Resilient Humanoids that spread and adapt to other societies. Mature at 24, live to ~80.',
   traits:['Human'],
   major:{name:'Human Recovery',text:"After you roll dice to gain a Wound, you can use this trait to change one of those dice results to a 1. Once you use this trait, you can't use it again until you finish an Intermission."},
   minor:{name:'Beyond Limits',text:"You can Push a check that you have gained a success in, potentially making it a critical or supercritical success but also risking a Break. Once you have used this trait, you can't do so again until you finish an Intermission."},
   features:`Human Recovery (Major Trait): After you roll dice to gain a Wound, you can use this trait to change one of those dice results to a 1. Once you use this trait, you can't use it again until you finish an Intermission.

Beyond Limits (Minor Trait): You can Push a check that you have gained a success in, potentially making it a critical or supercritical success but also risking a Break. Once you have used this trait, you can't do so again until you finish an Intermission.`},

  {name:'Ocotos', type:'Traditional', size:'Medium', speed:30, height:"4'–6'",
   langs:{speak:['Aquon','Gaian'], read:['Aquon','Gaian']},
   desc:"Cephalopod Humanoids - last surviving nobility from the lost world. Mature at 18, live to ~92.",
   traits:['Ocoto'],
   major:{name:'Colorful Skin',text:"Ocotos can change the color of their skin at will and match it to their surroundings. When not wearing Plate armor, use a Quick action to Camouflage. While Camouflaged, you gain the Obscured Condition against creatures more than 5 feet away. Camouflage lasts until you attack, cast a Spell, or physically interact with another creature. Every 1 foot of movement costs 2 feet of Speed while Camouflaged."},
   minor:{name:'Deep Sea Creature',text:'You can breathe underwater and have a Swim Speed equal to your base Speed. Your HP also gains resistance against Force damage.'},
   features:`Colorful Skin (Major Trait): Ocotos can change the color of their skin at will. When not wearing Plate armor, use a Quick action to Camouflage. While Camouflaged, you gain the Obscured Condition against creatures more than 5 feet away. Camouflage lasts until you attack, cast a Spell, or physically interact with another creature.

Deep Sea Creature (Minor Trait): You can breathe underwater and have a Swim Speed equal to your base Speed. Your HP also gains resistance against Force damage.`},

  {name:'Pridae', type:'Traditional', size:'Medium', speed:30, height:"4'–6'",
   langs:{speak:['Prado','Gaian'], read:['Sybus','Gaian']},
   desc:'Insectoid creatures from the deep underground of Gaia. Mature at 15, live to ~90.',
   traits:['Pridae'],
   major:{name:'Evolved Purpose',text:'Choose one: Hardened Shell, Small Wings, or Enhanced Antennae. See selection below.'},
   minor:{name:'Additional Arms',text:'You have two additional smaller arms. They cannot use weapons without the Light Feature nor wield shields. You can use these arms to perform the Interact action as a Free action once per turn.'},
   features:`Evolved Purpose (Major Trait): Select one of the following traits: Hardened Shell (max DP when wearing armor increased by 5), Small Wings (gain a Fly Speed equal to your base Speed as a Quick action), or Enhanced Antennae (telepathically speak with creatures you can see within 30 ft).

Additional Arms (Minor Trait): You have two additional smaller arms. These arms cannot use weapons without the Light Feature, nor wield shields. You can use them to perform the Interact action as a Free action once per turn.`},

  {name:'Sylvaniks', type:'Traditional', size:'Medium', speed:30, height:"5'–7'",
   langs:{speak:['Sylvan','Gaian'], read:['Sylvan','Gaian']},
   desc:'Plant-based Humanoids with a connection to knowledge and wisdom. Mature at 30, live to ~600.',
   traits:['Sunlight','Midnight'],
   traitDetails:{
     Sunlight:{
       label:'Sunlight',
       desc:'Sunlight Sylvaniks.',
       major:{name:'One with Nature',text:"You gain the ability to talk with Beasts and commune with Plants. When communing with a Plant, touch it over 1 minute. During that minute, you see the Plant's memories of its surroundings in the past 24 hours."},
       minor:{name:'Blessed Health',text:'When you expend a Recovery die toward your HP or MP, you replenish an additional 2 Status Points per Recovery die spent.'},
     },
     Midnight:{
       label:'Midnight',
       desc:'Midnight Sylvaniks.',
       major:{name:'Mind Over Matter',text:'When you start your turn with the Dazed or Shocked condition, you can use this trait as a Free Action to cleanse yourself of it. Once you use this trait, you cannot use it again until you finish an Intermission.'},
       minor:{name:'Enhanced Meditation',text:'When you expend a Recovery die toward your Sorce Points, you replenish an additional 3 Sorce Points per Recovery die spent.'},
     },
   },
   features:'Choose a sub-group below.'},

  {name:'Armorai', type:'Otherworldly', size:'Medium', speed:30, height:"5'–6'",
   langs:{speak:['Draconic','Gaian'], read:['Draconic','Gaian']},
   desc:'Living crystals that infect suits of armor to gain a body. Constructs - do not age.',
   traits:['Armorai'],
   otherworldlyTraits:[
     {name:'Construct Nature', text:"Your HP is special as you are made of metal. When a creature attempts to Bandage you, they must use a tool kit instead of a medical kit. Whenever you replenish your armor's DP, you regain HP equal to half the amount restored. Magical and alchemical healing toward HP do not work on you."},
     {name:'Iron Veins', text:'You are immune to Disease and the Poisoned Condition. You do not need to eat, drink, or breathe. You must spend approximately 4 hours a day meditating to prevent your mind from deteriorating.'},
     {name:'Creatures of Logic', text:'You gain resistance to Fear damage but have a -4 modifier on all Empathy checks. You can choose to remove this trait when creating your character.'},
   ],
   features:`Construct Nature (Major Trait): Your HP is special as you are made of metal. When a creature attempts to Bandage you, they must use a tool kit. Whenever you replenish your armor's DP, you regain HP equal to half the amount restored. Magical and alchemical healing toward HP do not work on you.

Iron Veins (Minor Trait): You are immune to Disease and the Poisoned Condition. You do not need to eat, drink, or breathe. You must spend approximately 4 hours a day meditating to prevent your mind from deteriorating.

Creatures of Logic: You gain resistance to Fear damage but have a -4 modifier on all Empathy checks. You can choose to remove this trait when creating your character.`},

  {name:'Darkaen', type:'Otherworldly', size:'Medium', speed:30, height:"4'–6'",
   langs:{speak:['Demoid','Gaian'], read:['Demoid','Gaian']},
   desc:'Demons created from the souls of Gaians. Mature at 18, live to ~666 years.',
   traits:['Darkaen'],
   otherworldlyTraits:[
     {name:'Night Flight', text:'You have two large bat wings on your back that grant you 5 Fly Speed for every 10 base Speed you have. When not using them, you can have them wrapped around you, being indistinguishable from a cloak.'},
     {name:'Shadow Eyes', text:'You gain Gloom Vision.'},
     {name:'Unholy', text:'Your HP gains vulnerability to Radiant damage but resistance to Necrotic damage.'},
   ],
   features:`Night Flight (Major Trait): You have two large bat wings on your back that grant you a Fly Speed equal to half your base Speed. When not using them, they wrap around you like a cloak.

Shadow Eyes (Minor Trait): You gain Gloom Vision.

Unholy: Your HP gains vulnerability to Radiant damage but resistance to Necrotic damage.`},

  {name:'Ozonian', type:'Otherworldly', size:'Small or Medium', speed:30, height:"3'–6'",
   langs:{speak:["One traditional language (player's choice)",'Gaian'], read:["One traditional language (player's choice)",'Gaian']},
   desc:'Humanoid Slimes with the ability to shift and look like other Lineages.',
   traits:['Ozonian'],
   otherworldlyTraits:[
     {name:'Fluid Identity', text:'As a Standard action, change your physical appearance to look and feel like another Humanoid the same size as you. This includes race, sex, skin color, hair, and height. You cannot change your voice; clothes and equipment do not change.'},
     {name:'Slippery', text:'When Grappled, you can spend a Quick action to end the Condition on yourself. You may also squeeze through openings as if you were one size smaller.'},
     {name:'Liquid Form', text:'Your HP gains vulnerability to Frost damage. When struck with Frost damage while in the identity of a different creature, your Fluid Identity cracks and you return to normal.'},
   ],
   features:`Fluid Identity (Major Trait): As a Standard action, change your appearance to look like another Humanoid the same size as you. You cannot change your voice; your clothes and equipment do not change.

Slippery (Minor Trait): When Grappled, spend a Quick action to end the Condition. You may squeeze through openings as if one size smaller.

Liquid Form: Your HP gains vulnerability to Frost damage. When struck with Frost damage while disguised, your Fluid Identity cracks and you return to normal.`},

  {name:'Undead', type:'Otherworldly', size:'Varies', speed:30, height:'Varies',
   langs:{speak:['Necrosis','Gaian'], read:['Necrosis','Gaian']},
   desc:"A soul bound to their corpse or another body. Cannot age.",
   traits:['Undead'],
   otherworldlyTraits:[
     {name:'Repurposed', text:'Choose the traditional Lineage your body was originally from. You gain the major trait of that Lineage. If your body or head is destroyed, you die.'},
     {name:'Build-a-Body', text:'You can remove and replace limbs from your body (5 minutes to adjust). Wounds to those limbs can be cleansed during an Intermission with a spare humanoid corpse.'},
     {name:'Undead Nature', text:'Healing to HP received from magic and alchemy is halved. You do not need to eat, drink, breathe, or sleep.'},
   ],
   features:`Repurposed (Major Trait): Choose the traditional Lineage your body was originally from. You gain the major trait of that Lineage. If your body or head is destroyed, you die.

Build-a-Body (Minor Trait): You can remove and replace limbs. Limb Wounds can be cleansed during an Intermission with a spare corpse.

Undead Nature: Healing from magic and alchemy is halved. You do not need to eat, drink, breathe, or sleep.`},
];

const CLASSES = [
  {
    name:'Fighter', spellcasting:null,
    desc:'Frontline brawlers who shrug off damage and dominate in melee. High resilience with access to Martial and General Talents.',
    attrBonus:{STR:1},
    skillBonus:['Endure'],
    skillChoice:[
      {pick:1, from:['Brawl','Shoot'],       label:'Pick one:'},
      {pick:1, from:['Might','Intimidate'],  label:'Pick one:'},
    ],
    talents:'Martial Talents, General Talents',
    specialties:['Guardian','Berserker','Engineer','Pugilist'],
  },
  {
    name:'Vagabond', spellcasting:null,
    desc:'Agile duelists who excel at dealing damage and outmaneuvering enemies. Access to Martial and General Talents.',
    attrBonus:{AGI:1},
    skillBonus:['Move'],
    skillChoice:[
      {pick:1, from:['Brawl','Shoot'],     label:'Pick one:'},
      {pick:1, from:['Hide','Finesse'],    label:'Pick one:'},
    ],
    talents:'Martial Talents, General Talents',
    specialties:['Sharpshooter','Elemancer','Alchemist','Reaver'],
  },
  {
    name:'Magi', spellcasting:'Wits',
    desc:'Devoted scholars of Sorce. Master spellcasters with access to Sorcery and General Talents. Spellcasting Attribute: Wits.',
    attrBonus:{WIT:1},
    skillBonus:['Insight'],
    skillChoice:[
      {pick:1, from:['Analyze','Survival'], label:'Pick one:'},
      {pick:1, from:['Move','Endure'],      label:'Pick one:'},
    ],
    talents:'Sorcery Talents, General Talents',
    specialties:['Spellweaver','Warlock','Oracle','Witch'],
  },
  {
    name:'Druid', spellcasting:'Empathy',
    desc:'Conduits of natural forces who support allies and shift forms. Access to Sorcery and General Talents. Spellcasting Attribute: Empathy.',
    attrBonus:{EMP:1},
    skillBonus:['Insight'],
    skillChoice:[
      {pick:1, from:['Manipulate','Perform'], label:'Pick one:'},
      {pick:1, from:['Medical','Tame'],       label:'Pick one:'},
    ],
    talents:'Sorcery Talents, General Talents',
    specialties:['Shapeshifter','Summoner','Sonneteer','Cleric'],
  },
];

const SPECIALTIES = {
  Guardian:    {cls:'Fighter',  resource:'Stamina Points',  desc:'Formidable knights who can protect allies and absorb punishment.'},
  Berserker:   {cls:'Fighter',  resource:'Stamina Points', desc:'Wild warriors who embrace pain and deal devastating damage through reckless ferocity.'},
  Engineer:    {cls:'Fighter',  resource:'Energy Points',  desc:'Master tacticians who deploy innovative Constructs to control the battlefield.'},
  Pugilist:    {cls:'Fighter',  resource:'Stamina Points',             desc:'Unarmed combat masters who shift between powerful stances to amplify their prowess.'},
  Sharpshooter:{cls:'Vagabond', resource:'Focus Points',   desc:'Precision marksmen who strike from afar with unparalleled accuracy.'},
  Elemancer:   {cls:'Vagabond', resource:'Focus Points',  desc:'Warriors who infuse their attacks with elemental forces through the ancient art of Elemancy.'},
  Alchemist:   {cls:'Vagabond', resource:'Energy Points',  desc:'Crafters of potent Elixirs, Poisons, and Oils who prepare extensively before battle.'},
  Reaver:      {cls:'Vagabond', resource:'Energy Points', desc:'Dark art practitioners who draw power from Reapers of the Necropolis.'},
  Spellweaver: {cls:'Magi',     resource:'Focus Points',   desc:'Knowledge channelers who empower and amplify their Spellcraft for maximum effect.'},
  Warlock:     {cls:'Magi',     resource:'Contracts (special resource)',  desc:'Mages who draw power from otherworldly entities through special contracts.'},
  Oracle:      {cls:'Magi',     resource:'Stamina Points',   desc:'Gifted seers who can predict the future and manipulate the very fabric of magic around them.'},
  Witch:       {cls:'Magi',     resource:'Energy Points', desc:'Enchanters with a loyal familiar that can buff allies while hexing enemies.'},
  Shapeshifter:{cls:'Druid',    resource:'Energy Points', desc:'Druids who transform into animal forms and emulate the myriad creatures of nature.'},
  Summoner:    {cls:'Druid',    resource:'Stamina Points',  desc:'Druid-bonded spirit callers who summon powerful companions from the Shroud.'},
  Sonneteer:   {cls:'Druid',    resource:'Focus Points',   desc:'Word-wielders who use song and speech to empower allies and enchant foes.'},
  Cleric:      {cls:'Druid',    resource:'Energy Points',             desc:'Divine healers who channel ideals to mend wounds and bolster allies\' spirits.'},
};

const LIFEPATH = {
  upbringings:[
    {roll:1, name:'Cultural',    desc:'Grew up with a specific heritage or religion, engaging with its traditions and stories.'},
    {roll:2, name:'Industrious', desc:'Grew up in a physically demanding environment, thriving through hard work.'},
    {roll:3, name:'Militaristic',desc:'Followed a strict regimen to serve and protect an authority figure or way of life.'},
    {roll:4, name:'Nomadic',     desc:'Spent most of your life traveling and meeting different cultures and people.'},
    {roll:5, name:'Royalty',     desc:'Grew up in a large estate learning diplomacy, governance, and etiquette.'},
    {roll:6, name:'Scholarly',   desc:'Strove to learn new things through a college or other academic institution.'},
    {roll:7, name:'Wild',        desc:'Lived with a community or alone in the natural wilds, away from modern civilization.'},
    {roll:8, name:'Desperate',   desc:'Had to struggle and work harder than most just to survive since earliest memory.'},
  ],
  cultures:[
    {roll:1, name:'Castle',    desc:'Rigid social hierarchy of nobility; you or your family had access to wealth and power.'},
    {roll:2, name:'City',      desc:'Area of trade and commerce; you\'ve seen many walks of life.'},
    {roll:3, name:'Natural',   desc:'Grew up in the wilds with a deep connection to the land.'},
    {roll:4, name:'Seafaring', desc:'Strong connection to the sea and love for exploration.'},
    {roll:5, name:'Temple',    desc:'Religious or spiritual society; deep faith or skepticism toward it.'},
    {roll:6, name:'Village',   desc:'Small rural area that relied on farming and tight-knit community bonds.'},
    {roll:7, name:'Wayfaring', desc:'Constantly traveling across the land; resourceful and adaptable.'},
    {roll:8, name:'Custom',    desc:'Your backstory is too unique to match any of the above options.'},
  ],
  personality:[
    {roll:1, name:'Shy / Secretive'},
    {roll:2, name:'Rebellious / Violent'},
    {roll:3, name:'Arrogant / Proud'},
    {roll:4, name:'Stable / Serious'},
    {roll:5, name:'Silly / Lighthearted'},
    {roll:6, name:'Sneaky / Deceptive'},
    {roll:7, name:'Intellectual / Detached'},
    {roll:8, name:'Friendly / Outgoing'},
  ],
  values:[
    {roll:1, name:'Money'},     {roll:2, name:'Family'},
    {roll:3, name:'Honor'},     {roll:4, name:'Knowledge'},
    {roll:5, name:'Justice'},   {roll:6, name:'Love'},
    {roll:7, name:'Power'},     {roll:8, name:'Friendship'},
  ],
  upsets:[
    {roll:1, name:'A Certain Temperature'},  {roll:2, name:'Too Many Questions'},
    {roll:3, name:'Public Speaking'},         {roll:4, name:'Cold Silence'},
    {roll:5, name:'Pitch Darkness'},          {roll:6, name:'A Specific Creature'},
    {roll:7, name:'Too Little Space'},        {roll:8, name:'A Specific Sight or Smell'},
  ],
  decisions:[
    {roll:'1-2', name:'Honorable',   desc:'You care deeply about how others perceive you and wish to earn their respect. You strive to uphold a code of ethics, duty, or tradition. Your actions are often guided by a sense of moral responsibility, and you prioritize integrity, even if it makes things harder.'},
    {roll:'3-4', name:'Practical',   desc:'You prefer to approach situations with logic and efficiency, making decisions based on what is most effective or beneficial at the moment. You value results over ideals, and you are willing to make compromises or sacrifices if it leads to a more favorable outcome.'},
    {roll:'5-6', name:'Independent', desc:'You march to the beat of your own drum, caring little for external validation or societal expectations. You prefer to make decisions based on your personal beliefs and values, and you prioritize freedom and self-expression. Rules or norms are often secondary to what feels right to you.'},
  ],
  viewOfOthers:[
    {roll:'1-2', name:'Compassionate', desc:"You believe in kindness and empathy as guiding principles. You often prioritize others' well-being and seek to foster cooperation, trust, and mutual understanding. Your actions are motivated by a desire to reduce harm and promote harmony."},
    {roll:'3-4', name:'Realistic',     desc:"You see the world as it is, neither overly optimistic nor overly pessimistic. You understand that people are flawed, and you don't expect perfection from them. While you're not necessarily cynical, you are aware of the limits of kindness and idealism, making you more practical in your dealings with others."},
    {roll:'5-6', name:'Resilient',     desc:"You see the world as full of challenges, and you value perseverance and strength of character. You believe in pushing through adversity, and you respect others who can endure hardship. You may come across as tough or unyielding, but you value growth through struggle."},
  ],
};


// -- Talent rank-by-rank data (verbatim from the Core Rulebook) ---------
const TALENT_DATA = {
  "Boar Style": [
    "Unlock Boar’s Temper (A): spend 2 Sorce to charge up to 10 feet in a line and make a melee attack. If you moved at least 10 feet straight beforehand, base damage +2.",
    "Boar’s Temper now lets you charge up to 20 feet.",
    "Boar’s Temper’s straight-line bonus is now +4 base damage instead of +2.",
    "Boar’s Temper: spend 2 extra Sorce to deal +2 damage (base type) per 5 feet moved straight, up to +12. It now also lets you charge up to 30 feet.",
    "Boar’s Temper: spend 4 extra Sorce to charge through hostile creatures’ spaces; each takes damage as if hit by a Melee Weapon Attack. Combines with the Rank 3 feature, but creatures charged through don’t take the Rank 4 damage. (See Talents chapter, Core Rulebook.)"
  ],
  "Brawler": [
    "Spend 2 Sorce to attempt a Grapple on an Opportunity Strike instead of a Melee Weapon Attack.",
    "You can Grapple creatures one size larger than you at a -1 modifier.",
    "A creature you're Grappling has a -3 modifier to attack any creature that isn't grappling it.",
    "You can Grapple creatures two sizes larger than you at a -2 modifier.",
    "While Grappling a creature, spend 6 Sorce to give it Restrained until the Grapple ends."
  ],
  "Calvary Fighter": [
    "While mounted, all physical damage your mount takes is halved.",
    "When your mount is targeted by a Melee or Ranged Weapon Attack, spend 2 Sorce (Free action) to redirect it to you.",
    "If your mount is a Beast, it can use its melee attacks at a -3 modifier while you're mounted. If a trait already allows that, this instead removes that trait's negative modifiers for attacking while mounted.",
    "When you move at least 10 ft. straight while mounted right before a Melee Weapon Attack, its base damage +4.",
    "If your mount is a Beast, your mounted Melee Weapon Attacks deal +2 base damage — or +4 against unmounted creatures smaller than your mount."
  ],
  "Crane Style": [
    "Unlock Crane’s Grace (P): spend 2 Sorce (Quick action) to leap 10 feet in a line without provoking Opportunity Strikes. You can leap over hostile creatures your size or smaller.",
    "Crane’s Grace now lets you leap up to 15 feet.",
    "Unlock Flutter (A): spend 4 Sorce to make a Melee Weapon Attack, then (hit or miss) leap 15 feet away from the target without provoking Opportunity Strikes.",
    "After using Crane’s Grace or Flutter, gain the Disengage action's benefits until the end of your next turn.",
    "Crane’s Grace is now a Minor Action. Flutter becomes a Power (P) usable as a Free Action after any Melee Weapon Attack, so it can combine with Attacks (A) from other talents. (See Talents chapter, Core Rulebook.)"
  ],
  "Defender": [
    "Unlock Guard (P): when a willing creature within 5 feet is hit by a Melee or Ranged Weapon Attack, use a Reaction to Block or Parry it for them. You must wield a weapon or shield (a weapon only Guards attacks you can Parry). The ally takes any damage you don't fully Block/Parry and can't Dodge, Parry, or Block it themselves.",
    "You can spend 2 Sorce instead of a Reaction to use Guard.",
    "When a creature you Guard still gets hit, spend 3 Sorce to redirect half the attack's damage to you (calculated before resistances, vulnerabilities, and immunities).",
    "When a creature within 5 feet makes a Might or Move save, spend 2 Sorce (Free Action) to Assist it with your Might or Move.",
    "Spend 4 Sorce to enter Defender Stance until the start of your next turn: Guard without spending Sorce or a Reaction, and Block or Parry attacks on you without a Reaction. Your own attacks take a -4 modifier during it."
  ],
  "Dragon Style": [
    "Unlock Piercing Blow (P): spend 3 Sorce to shoot or throw in a 20-foot line; every creature in the path takes damage as if hit by a Ranged Weapon Attack.",
    "Piercing Blow’s line is now 40 feet.",
    "Unlock Spread Blow (P): spend 6 Sorce to fire or throw a Sorce-infused weapon in a 20-foot cone; each creature in it takes damage as if hit by a Ranged Weapon Attack. The weapon or ammo isn't destroyed.",
    "All Powers from this talent deal +4 damage of the weapon's base type.",
    "Unlock Explosive Blow (P): spend 9 Sorce to fire or throw a Sorce-infused weapon at a point within max range; it explodes in a 20-foot-radius sphere. Each creature in it takes damage as if hit by a Ranged Weapon Attack with that weapon. The weapon or ammo isn't destroyed. (See Talents chapter, Core Rulebook.)"
  ],
  "Duelist": [
    "Unlock Riposte (P): if your Parry stops a melee attack, spend 2 Sorce to deal the attacker half the damage of a Melee Weapon Attack with the weapon you parried with (including its Features, Poisons, and any spell/oil/effect damage). This doesn't count as a Melee Weapon Attack for other abilities. The attacker must be within your reach.",
    "You can Parry Ranged Weapon and Spell attacks.",
    "When targeted by a Melee or Ranged Weapon Attack, spend 3 Sorce (Free Action) instead of a Reaction to Parry.",
    "Riposte now deals your attack's full damage instead of half.",
    "When you Parry, spend 4 Sorce to reroll up to three dice in the check (not the Pushed dice if you Pushed)."
  ],
  "Ignore Pain": [
    "Unlock Toughen Up (P): when you take damage, spend a Reaction to reduce it by 4 (minimum 1). Not against Fear or Psychic damage.",
    "Spend 2 Sorce (Free Action) instead of a Reaction to use Toughen Up.",
    "Toughen Up now works against Fear and Psychic damage.",
    "When using Toughen Up, spend 2 Sorce (Free Action) to reduce the damage by 12 instead (minimum 1).",
    "Unlock Didn’t Hear No Bell (P): if damage would reduce your HP or MP to 0, spend 2 Sorce (Free Action) to regain up to 24 of whichever hit 0, after rolling the Wound or Trauma. Can't be used if that Wound/Trauma would kill you. Cost rises by 2 per Wound (for HP) or Trauma (for MP) you already have."
  ],
  "Mantis Style": [
    "Unlock Multi Strike (A): spend 3 Sorce to strike twice with two different 1h weapons in one attack. On a hit, deal the first weapon's full effects plus half the second weapon's damage (that half doesn't benefit from crits). With Ammo weapons, spend 2 more Sorce to reload after the attack as a Free Action.",
    "Your first Off-Hand Attack each turn has only a -2 modifier.",
    "Your first Off-Hand Attack each turn has only a -1 modifier.",
    "Multi Strike's second weapon now deals its full attack damage instead of half.",
    "On a successful Multi Strike, use it again as a Quick action at a -1 modifier until end of turn."
  ],
  "Master of Defense": [
    "While wearing an armor set or natural armor, max DP +4.",
    "While wearing an armor set or natural armor, max DP +8 more.",
    "While wearing an armor set or natural armor, max DP +12 more.",
    "While wearing an armor set or natural armor, max DP +16 more.",
    "While wearing an armor set or natural armor, max DP +20 more."
  ],
  "Opportunist": [
    "When a creature willingly enters your weapon's reach for the first time on a turn, you can make an Opportunity Strike against it.",
    "When you can make an Opportunity Strike, spend 2 Sorce (Free Action) instead of a Reaction.",
    "Spend 4 Sorce (Free Action) to make an Opportunity Strike on a creature that has Disengaged.",
    "Unlock Cripple (P): on an Opportunity Strike hit, spend 3 Sorce (Free Action) to halve the enemy's Speed until the start of its next turn. Enemies 2+ sizes larger, or that can't be slowed, instead take +4 damage of the weapon's base type. Once used on a creature, not again on it until the end of your next turn.",
    "Cripple now reduces Speed to 0 until the start of the enemy's next turn; for enemies 2+ sizes larger or that can't be slowed, its extra damage rises to 8."
  ],
  "Porcupine Style": [
    "While wielding a shield, you can use it as a melee weapon with base Blunt damage equal to double its defense modifier. You can't add the shield's modifier to the attack check.",
    "Unlock Counter (P): when you successfully Block a melee attack from within 5 feet, spend 4 Sorce (Free Action) to hit the attacker as if with a shield Melee Weapon Attack.",
    "Whenever you Block a melee attack from within 5 feet, the attacker takes 2 Blunt damage whether it hit or missed.",
    "Shields you wield deal +4 base damage.",
    "Unlock Pummel (P): on a successful shield attack, spend 6 Sorce (Free Action) to attempt to Shove the creature Prone. On a successful Shove, until end of turn you may use a Quick Action to deal your shield's base damage to it while it's Prone."
  ],
  "Primal Style": [
    "Unlock Cleave (P): after a successful Melee Weapon Attack, spend 3 Sorce (Quick action) to hit another creature within your reach as if with a Melee Weapon Attack. Can't be used if you moved first, or again until the start of your next turn.",
    "You can now activate Cleave as a Minor action.",
    "You can now activate Cleave as a Free action.",
    "Cleave: spend 6 Sorce instead of 3 to target up to two creatures within reach instead of one.",
    "Cleave: spend 9 Sorce instead of 3 to target up to four creatures within reach instead of one. (See Talents chapter, Core Rulebook.)"
  ],
  "Rabbit Style": [
    "Unlock With Haste (P): once per turn, spend 2 Sorce (Free action) to increase your Speed by 10 feet until end of turn.",
    "Under With Haste, you can run across water and up walls; if you stop on either to act, you fall after the action resolves.",
    "Under With Haste, you can Hasten as a Quick Action on your turn.",
    "Under With Haste, spend 2 Sorce to Hasten as a Free Action once per turn.",
    "With Haste's bonus Speed rises to 30, and you gain the Disengage action's benefits until end of turn."
  ],
  "Rubber Style": [
    "Unlock Bounce Strike (P): after a successful Ranged Weapon Attack, spend 3 Sorce (Quick action) to hit another creature you see within 15 feet of the first as if with a Ranged Weapon Attack. Can't be used if you moved or acted first, or again until the start of your next turn.",
    "You can now activate Bounce Strike as a Minor action.",
    "You can now activate Bounce Strike as a Free action.",
    "Bounce Strike: spend 6 Sorce instead of 3 to add a third target within 15 feet of the second. You can't reuse the creature hit by the triggering attack.",
    "Bounce Strike: spend 9 Sorce instead of 3 to add a third target (within 15 feet of the second) and a fourth (within 15 feet of the third). No target may repeat, including the creature hit by the triggering attack. (See Talents chapter, Core Rulebook.)"
  ],
  "Sniper Style": [
    "When your ranged attack benefits from Aim, it gains an extra +1 modifier.",
    "Spend 2 Sorce on your turn to Aim as a Free action, once per turn.",
    "On an Aim-boosted Ranged Weapon Attack, spend 2 Sorce to reroll one die (not the Pushed dice), once per turn.",
    "An Aim-boosted Ranged Weapon Attack that hits deals +2 base damage.",
    "When you Aim, spend the rest of your Speed (Free Action) to enhance it: until end of turn, your next Aim-boosted ranged attack deals +2 base damage per 10 Speed spent, up to +10."
  ],
  "Tiger Style": [
    "A Wind-Up-boosted Melee Weapon Attack that hits deals +2 base damage.",
    "Spend 2 Sorce on your turn to Wind-Up as a Free action, once per turn.",
    "On a Wind-Up-boosted Melee Weapon Attack, spend 2 Sorce to reroll one die (not the Pushed dice), once per turn.",
    "A Wind-Up-boosted Melee Weapon Attack that hits deals +2 more base damage (total +4).",
    "Using Wind-Up while already benefiting from it grants a Mega-Wind-Up (still counts as Wind-Up for other abilities), which changes this talent's bonuses:\nReroll up to two dice instead of one.\nBase damage increase is now 8.\nAnything that would end a Wind-Up ends the Mega-Wind-Up."
  ],
  "Tortoise Style": [
    "Unlock Fortify (P): while wielding a shield, spend up to 3 Sorce (Quick action) to gain 12 Temp DP for 1 minute or until you stop wielding the shield. This Temp DP shares your DP's resistances, vulnerabilities, and immunities.",
    "On a Move save to reduce or avoid damage, add your shield's modifier as a positive modifier.",
    "Spend 2 Sorce instead of a Reaction to Block a melee or ranged attack with a shield.",
    "Fortify's Temp DP now resists Slash, Pierce, and Blunt damage.",
    "When you Block, spend 4 Sorce to reroll up to three dice in the check (not the Pushed dice)."
  ],
  "Viper Style": [
    "Unlock Leg Strike (A): a Standard-action attack at a -3 modifier. On a success, all the creature's Speeds drop by 20 feet until the start of your next turn (never below half normal).",
    "Unlock Arm Strike (A): a Standard-action attack at a -3 modifier. On a success, the creature's attack base damage drops by 4 until the start of your next turn.",
    "Leg Strike and Arm Strike now take only a -2 modifier instead of -3.",
    "Leg Strike also gives -2 to the creature's Agility checks, and Arm Strike -2 to its Strength checks, until the start of your next turn.",
    "Unlock Head Strike (A): on a Standard-action Melee or Ranged Weapon Attack, take a -4 modifier to make it a Head Strike; on a hit, the creature is Slowed until the start of your next turn. (See Talents chapter, Core Rulebook.)"
  ],
  "Wolf Style": [
    "Unlock Flank (P): while you and an ally are both within 5 feet of a hostile creature, you're Flanking it and get a +1 modifier to melee attacks against it.",
    "While Flanking a creature, your melee attacks against it deal +2 base damage.",
    "Unlock Team Effort (P): the first time you Flank an enemy on your turn, pick an ally within 5 feet of it; they gain this Talent's Rank 1–2 benefits against that enemy until the start of your next turn (nothing if they already have those Ranks).",
    "While benefiting from Flank and Team Effort, you and the chosen ally get a +2 modifier and +4 base damage on melee attacks.",
    "Unlock Team Strike (A): while Flanking an enemy, spend 4 Sorce to make a melee attack against it; hit or miss, an ally within 5 feet of it may then make an Opportunity Strike against it at a -3 modifier as a Free action."
  ],
  "Elemental Attunement": [
    "When you learn this Talent, pick an element — Fire, Frost, Electric, or Acid — as your Elemental Attunement. Spells you cast that deal that damage type deal +4 damage of it.\nElemental Attunement Notes:\nRank 0 Spells gain only half this Talent's bonus damage.",
    "Your Spells of your Attunement's type ignore resistances to it.",
    "Spells of your Attunement's type now deal +8 damage of it.",
    "Your HP and DP gain resistance to your Attunement's type (immunity if either is already resistant).",
    "Spells of your Attunement's type now deal +12 damage of it."
  ],
  "Innate Magic": [
    "You innately learn a Rank 1 Spell.",
    "You innately learn a Rank 2 Spell.",
    "You innately learn a Rank 3 Spell.",
    "You innately learn a Rank 4 Spell.",
    "You innately learn a Rank 5 Spell. (See Talents chapter, Core Rulebook.)"
  ],
  "Megamind": [
    "Choose a Rank 1 Spell you know; it becomes your first Signature Spell.\nMegamind Notes:\nSignature Spells are always prepared and don't count against your prepared limit. Each also gains a benefit when cast:\nWith a Power Level: it gains 2 additional Power Levels.\nWithout one: its Sorce cost drops by the Rank it's cast at (never below half its normal cost).",
    "All Rank 0 Spells you know are always prepared and don't count against your prepared limit.",
    "Choose a Rank 2 Spell you know; it becomes your second Signature Spell.",
    "All Spells you know are now always prepared.",
    "Choose a Rank 3 Spell you know; it becomes your third Signature Spell."
  ],
  "Mental Shield": [
    "When you take non-Fear, non-Psychic damage, use a Reaction to redirect up to 10 of it to your MP (never more than half the damage taken).\nMental Shield Notes:\nCalculate redirected damage before any Resistances, Immunities, Vulnerabilities, or other effects that change the amount.",
    "You can now redirect up to 20 (never more than half the damage taken).",
    "When you take Fear damage, use a Reaction to halve it. You can't do this and redirect damage at the same time.",
    "You can now redirect any amount, up to half the damage taken.",
    "Spend 2 Sorce (Free Action) instead of a Reaction to transfer half the damage taken."
  ],
  "Runic Magic": [
    "You can inscribe runes on objects and surfaces, and learn a Runic Inscription.",
    "You learn a second Runic Inscription.",
    "You learn a third Runic Inscription.",
    "You can now have up to two Runes active at once; inscribing a third disables the oldest.",
    "While a Rune is active, use a Quick Action to move it to a new location or object without spending Sorce to recreate it. (See Talents chapter, Core Rulebook.)"
  ],
  "Spell Slinger": [
    "You can make an initiative check as a Spell check with a Study of Sorcery you know (the Spell you plan to cast first turn must be from that Study). It counts as a Skill check that can be Pushed. Requires wielding an Arcane Foci.",
    "You no longer need an Arcane Foci for it, and gain a +2 modifier on the initiative check.",
    "The initiative Spell check can use your highest Study of Sorcery's Rank even when casting from another Study, and gains another +1 modifier (total +3).",
    "On a successful initiative check, your first Spell that turn either gains 2 Power Levels or has its Sorce cost reduced by 3 (minimum 1), your choice.",
    "On a successful initiative check, if your first Spell has a Standard- or Quick-action cast time, you may cast it as a Minor action that turn — but not that same Spell again for the rest of the turn."
  ],
  "Study of Aeromancy": [
    "Spells learned:\nJolt: Shoot a small bolt of lightning in a line.\nBellowing Shout: Shout a thunderous, deafening phrase.\nLightning Arc: Fire a beam of lightning that jumps from one creature to another.\nFast as Light: Temporarily increase a creature’s Speed.",
    "Spells learned:\nReflux: Reactively enhance a creature’s reflexes against danger.\nSmall Nimbus: Summon a mountable nimbus cloud.",
    "Spells learned:\nLighting Beam: Fire a long, powerful line of lighting.\nFlash Step: Teleport to another location, electrifying those in your path.",
    "Spells learned:\nEnraged Nimbus: Summon a large storm cloud to shock those inside.\nSpear of Voltara: Hurl a powerful spear of lighting at a creature.",
    "Spells learned:\nStorm of Fury: Summon a mighty storm in the sky to strike down your enemies.\nMagnetivus: Attract all things in a large sphere to be pulled and restrained toward a specific point."
  ],
  "Study of Blood": [
    "Spells learned:\nVampiric Slash: Slash with blood claws to regain HP.\nInfatuate: Compliment a creature with enchanting words to gain favor.\nEnthrall Person: Force a Humanoid’s attitude toward you to be positive.\nInfuse Confuse: Confuse a creature to not be reactive.",
    "Spells learned:\nAdrenaline Boost: Increase a creature’s Speed temporarily.\nStir Emotions: Enchant a creature to follow a course of action.",
    "Spells learned:\nHot Head: Force a creature to give in to their violent rage.\nBrain Freeze: Shut down a Spellcaster’s focus on their Spells.",
    "Spells learned:\nSurge Flow: Increase the muscle mass of a creature immensely.\nSlow Flow: Cripple a creature’s movement and actions.",
    "Spells learned:\nBend Blood: Force a creature to attack targets you choose.\nBrain Rot: Attack a creature’s mind to severely hinder or potentially kill them."
  ],
  "Study of Contagion": [
    "Spells learned:\nAcid Dart: Fire a dart of acid at a creature.\nSicken Pulse: Hinder a creature trying to resist a Poison or Disease.\nToxic Wave: Release a cone of poisonous acid.\nWitherplague: Infect a creature with a Disease that hinders their attacks and healing.",
    "Spells learned:\nBlindblight: Infect a creature with a Disease that reduces their vision.\nProliferate: Spread a disease that a creature is suffering from to other creatures.",
    "Spells learned:\nFeral Pox: Infect a creature with a Disease that forces them to get provoked easily.\nEroding Sludge: Create a pool of sludge that burns and weakens creatures.",
    "Spells learned:\nMindflare: Infect a creature with a Disease that makes casting Spells painful.\nStonefever: Infect a creature with a Disease that turns them into stone.",
    "Spells learned:\nPlague Requiem: Consume the diseases on nearby creatures to deal massive damage.\nBone Rot: Infect a creature with a Disease that makes their HP susceptible to damage."
  ],
  "Study of Cryomancy": [
    "Spells learned:\nIce Spear: Fire a spear of ice at a creature.\nSculpt Ice: Summon and shape different structures made of ice.\nDaggers of Ice: Fire multiple homing daggers made of ice.\nIce Barrier: Summon ice to brace yourself against Slash, Pierce, or Blunt damage.",
    "Spells learned:\nFrostbite: Blast a creature with frost, potentially slowing them.\nIce Armor: Conjure Temp DP made of ice that resists Slash and Frost damage.",
    "Spells learned:\nFlash Freeze: Freeze a large surface area while damaging creatures on it.\nCryostasis: Prevent yourself from taking lethal damage by freezing in place.",
    "Spells learned:\nUnstable Shard: Fire a large shard of ice that then explodes upon impact.\nBoreal Binds: Summon large frost shackles to restrain creatures around you.",
    "Spells learned:\nBlizzard: Summon a large, harsh blizzard that encompasses an area.\nAvalanche: Bury your enemies by summoning a ton of snow upon them."
  ],
  "Study of Death": [
    "Spells learned:\nReaper Scythe: Create a scythe you can use that harnesses the powers of Necropolis.\nRecompose: Extend the time a corpse stays fresh.\nSummon Skeleservant: Summon a faithful skeleton servant.\nDeath Speech: Speak with the dead from beyond the Veil.",
    "Spells learned:\nReap: Conjure two reaper blades to slash in a line.\nCurse Creature: Place a debilitating Curse upon a creature.",
    "Spells learned:\nRaise Dead: Raise the corpse of a fallen ally to temporarily fight for you.\nUndying Rune: Prevent a lethal Wound from taking effect.",
    "Spells learned:\nDrain Youth: Siphon a creature’s life with necrotic lightning.\nDeath Guillotine: Summon a large blade that deals extra damage to Bloodied creatures.",
    "Spells learned:\nDark Exchange: Curse a creature to take damage when you take damage.\nAura of Undeath: Prevent yourself and your nearby allies from gaining Wounds."
  ],
  "Study of Displacement": [
    "Spells learned:\nPocketswap: Pick a creature’s pocket from a distance.\nInfini Pocket: Create your own personal pocket dimension to store small items.\nBody Swap: Swap places with an ally.\nMinor Portals: Summon two small, linked portals to reach and shoot through.",
    "Spells learned:\nTactical Retreat: Disappear into the Shroud to reposition yourself safely.\nCreate Hole: Create a dark hole to move past a wall.",
    "Spells learned:\nReposition: Teleport yourself and an ally up to 100 feet.\nRescue: Teleport an ally away from damage.",
    "Spells learned:\nMajor Portals: Create two linked portals across long distances that you can move through.\nSkip Stride: Gain the ability to teleport as a Quick action.",
    "Spells learned:\nControl Space: Decide the placement of all creatures within a large space.\nShroud Sanctum: Temporarily create a haven in the Shroud you can teleport to and from."
  ],
  "Study of Divinity": [
    "Spells learned:\nBlessing of Protection: Bless a creature to prevent some of the damage they take.\nSearing Flare: Fire a bolt of radiant light at an enemy.\nVengeful Smite: Empower your next attack against those that tried to harm you.\nBlessing of Pacifism: Bless a creature to make it harder to target them with an attack.",
    "Spells learned:\nBlessing of Guardian: Bless a creature to transfer damage they take to you.\nExplosive Smite: Empower your next attack to deal an explosive amount of damage.",
    "Spells learned:\nBlessing of Radiance: Bless a creature to become a beacon of Divine Light.\nHoly Smite: Empower your next attack to bolster your defenses.",
    "Spells learned:\nDivine Sanctuary: Create a bubble of safety for yourself and your allies.\nBlessing of Flight: Bless a creature to gain the ability to fly.",
    "Spells learned:\nPrimal Smite: Cleave a creature and those behind it with a powerful attack.\nDivine Intervention: Ensure a creature succeeds on their saves."
  ],
  "Study of Geomancy": [
    "Spells learned:\nEarth Bend: Extend pillars of earth to craft a unique battlefield.\nRock Catapault: Hurl a rock at a creature.\nRepair Minerals: Repair the DP of an armor set.\nSpiked Terrain: Summon spikes of earth from the ground to hinder enemies.",
    "Spells learned:\nDebris Sandstorm: Summon a sandstorm to harm and hinder your foe’s vision.\nPropel Creature: Hurl a creature across the field and against a wall.",
    "Spells learned:\nEarth Structure: Summon and create a unique structure of stone walls.\nSummon Earth Warrior: Summon an Earth Warrior to fight for you.",
    "Spells learned:\nSummon Earth Knight: Summon a Large Earth Knight to fight for you.\nHurl Boulder: Summon and hurl a huge boulder that rolls over foes.",
    "Spells learned:\nEntomb: Crush a creature by burying them deep inside compressed earth.\nSummon Earth Golem: Summon a Huge Earth Golem to fight for you."
  ],
  "Study of Illusion": [
    "Spells learned:\nLesser Illusion: Create a small sound or image.\nFashionate: Change how your character looks.\nGreater Illusion: Create a large image you can speak through.\nCreate Disguise: Disguise yourself as another creature.",
    "Spells learned:\nInvisibility: Become Invisible so long as you don’t harm anyone.\nCreate Duplicate: Create a copy of yourself that you can cast Spells through.",
    "Spells learned:\nPlay Dead: Create an illusion to take part of a hit for you.\nPowerful Illusion: Create a huge illusion with sounds.",
    "Spells learned:\nGreater Invisibility: Remain Invisible even if you harm creatures.\nMass Disguise: Disguise yourself and multiple creatures to look like other creatures.",
    "Spells learned:\nMass Duplicate: Create multiple copies of yourself that you can swap positions with.\nDisguised Domain: Take complete control over a large area."
  ],
  "Study of Pyromancy": [
    "Spells learned:\nDancing Flame: Summon a small mote of flame to light your way.\nFire Ray: Fire a small beam of flame.\nBurst Self: Explode in a fiery burst.\nFire Missile: Fire a homing ball of flame.",
    "Spells learned:\nFire Aura: Gain Temp DP that is immune to Fire damage.\nFire Breath: Breathe a large cone of fire.",
    "Spells learned:\nExplosion: Make another creature explode in a fiery burst.\nFlame Jettison: Fly across the field with fire thrusters while breaking out of restraints.",
    "Spells learned:\nImmolate: Ignite a creature to be continuously on fire.\nWall of Fire: Create a large wall of made of fire that burns those that touch it and obscures sight.",
    "Spells learned:\nFire Blossom: Make three separate points to explode in a fiery blaze.\nFire Storm: Summon a huge fire tornado to overtake your foes."
  ],
  "Study of Recovery": [
    "Spells learned:\nTransfer Life: Transfer some of your HP to another creature.\nDislocate: Hit a creature with force and push them back.\nReinvigorate: Replenish a creature’s HP.\nCalm Emotions: Replenish a creature’s MP.",
    "Spells learned:\nFortify: Grant a creature Temp HP and Temp MP.\nPurify: Cleanse a creature of a Poison or Disease.",
    "Spells learned:\nRemove Bane: Remove a specific Condition from a creature.\nMend Injuries: Recover a creature’s HP and cleanse a Wound or Doom Stack.",
    "Spells learned:\nRegeneration: Greatly enhance a creature’s natural regeneration.\nHealing Mist: Replenish multiple creatures’ HP around you.",
    "Spells learned:\nRepair Body: Replenish a massive amount of HP and heal harsh Wounds.\nDeny Death: Attempt to revive a creature from death."
  ],
  "Study of Shadows": [
    "Spells learned:\nFeed Fear: Enhance your next Fear based spell against a creature.\nManipulate Darkness: Create and manipulate darkness.\nTerrifying Gloom: Summon a Shadow Gloom that deals Fear damage to those within.\nFall: Rattle a creature’s mind with Fear, potentially forcing them Prone.",
    "Spells learned:\nShadow Walk: Teleport into darkness and become Hidden.\nTerrorizing Shadows: Invoke fear in a creature’s mind, making it painful to come near you.",
    "Spells learned:\nCloak of Shadows: Create a cloak that makes you Invisible while in darkness.\nMind Reave: Infuse fear into a creature’s mind, making them want to retreat from you.",
    "Spells learned:\nConsume Fears: Rip the fears out of a creature’s mind and use them to heal.\nMenacing Aura: Have a creature emit an aura of intimidation to instill fear in those near them.",
    "Spells learned:\nNightmare’s Grasp: Terrify a creature from the shadows with heavy Fear damage.\nDark Domain: Summon a large amount of Shadow Gloom you and your allies can see through."
  ],
  "Twist Magicka": [
    "You can twist your Spells to your will. You gain one Magicka.\nDistant Magicka: Spend 2 extra Sorce to double a Spell's range (touch becomes 10 feet). No effect on self-range or self-target Spells.\nExtend Magicka: Spend 2 extra Sorce to double the duration of a Spell lasting longer than instant.\nElemental Magicka: Spend 2 extra Sorce to change a non-Fear, non-Psychic damage Spell's type to Fire, Ice, Acid, or Electric.",
    "You gain a second Magicka.",
    "You gain a third Magicka.\nCareful Magicka: Spend up to 6 extra Sorce; per 2 spent, pick a creature to be immune to the Spell if it would be hit or affected.\nQuick Magicka: Spend 4 extra Sorce to cast a Standard-action Spell as a Quick action.\nSubtle Magicka: Spend 4 extra Sorce to ignore a Spell's Hand and Tongue components.",
    "You gain a fourth Magicka.\nDouble Magicka: Spend 6 extra Sorce to have a single-target Spell target 1 more creature.\nExplosive Magicka: Spend 6 extra Sorce to double the size of a shape-creating Spell's shape.",
    "You can use up to 2 Magicka per turn."
  ],
  "War Caster": [
    "You gain a +2 modifier on Endure saves to keep focus after taking non-Fear, non-Psychic damage.",
    "You can Encant as a Quick action: your next Spell check gains a +1 modifier. Any action other than casting a Spell with a Spell check loses this benefit.",
    "On an Opportunity Strike, you can cast a Rank 1 or lower Spell that targets only the creature that triggered it.",
    "You can ignore the Hand component of casting Spells.",
    "If you fail an Endure save to keep focus on a Spell, use this trait to gain 1 success (once per Light or Full Rest). Psychic damage no longer inflicts its extra -2 modifier on your Endure saves to maintain focus."
  ],
  "Academic": [
    "Increase your max MP by 4.",
    "Increase your max MP by an additional 8.",
    "Increase your max MP by an additional 12."
  ],
  "Angelic Blood": [
    "You become resistant to Radiant damage but vulnerable to Necrotic damage. You also gain the Celestial creature type and you can speak Solari. You cannot take this Talent if your creature type is Demon."
  ],
  "Animal Ally": [
    "You can talk with animals; if you already can, you gain a +2 modifier on Empathy checks with Beasts."
  ],
  "Animal Companion": [
    "You can spend a downtime day to find and bond with a Small Beast of CL -2 (the GM sets what's available). While bonded:\nIt becomes an NPC Companion that doesn't count against your group's NPC Companion limit. It obeys you when near, but acts on self-preservation when out of sight.\nIt can wear Beast Armor.\nBonding with a new Beast replaces the old one.\nIt can be trained during downtime to raise its CL (standard Companion training rules).\nWhen it's targeted by a Melee or Ranged attack and can hear you, spend a Reaction to oppose the attack with your Tame (it dodges).\nWhile it's within 120 ft. and can hear you, spend a Reaction to Assist its skill checks with your Tame."
  ],
  "Backseat Braining": [
    "When you Assist a creature's Skill check, use this Talent to Assist with your Analyze regardless of the Skill. Once per Intermission."
  ],
  "Caster Initiate": [
    "You learn 1 Sorcery Talent of your choice. If it grants a Study of Sorcery or Innate Magic and you lack Spellcasting, you gain Spellcasting with either Empathy or Wits as your Spellcasting Attribute. You can rank up this gained Talent with Talent Points, but can't access other Sorcery Talents without the Magi or Druid Class."
  ],
  "Demonic Blood": [
    "You become resistant to Necrotic damage but vulnerable to Radiant damage. You also gain the Demon creature type and can speak Demoid. You cannot take this Talent if your creature type is Celestial."
  ],
  "Field Medic": [
    "With a medical kit equipped, use a Quick action to Stanch a creature missing HP within 5 feet (including yourself); make a Medical check.\nSuccess: restore 12 HP.\nCritical: 24 HP.\nSupercritical: 48 HP.\nFailure: restore 1d8+4 HP.\nYou can't Stanch the same creature again until a Light or Full Rest.",
    "You can Bandage as a Quick Action, and a successful Bandage or Stanch restores double the HP."
  ],
  "Full Dodge": [
    "When your Dodge gets at least one success, you may drop Prone after the Move check to gain two additional successes. Can't be used while Prone, Restrained, Exhausted, Grappled, wearing Plate armor, or in a form immune to Prone."
  ],
  "Heckler": [
    "When you Heckle, you can target up to 2 creatures. When targeting multiple NPCs, only the creature with the largest opposing Insight modifier opposes your check. PCs oppose your check individually."
  ],
  "Inspiring": [
    "Use a Quick action to Inspire a creature missing MP within 30 feet that can hear you (including yourself); make a Perform check.\nSuccess: grant 10 Temp MP for 1 minute.\nCritical: 20 Temp MP.\nSupercritical: 30 Temp MP.\nFailure: grant 1d8+4 Temp MP.\nYou can't Inspire the same creature again until an Intermission.\nYou can also Galvanize as a Quick Action, and your Galvanize range increases by 30 ft."
  ],
  "Intimidating": [
    "When you Taunt, you can target up to 2 creatures. When targeting multiple NPCs, only the creature with the largest opposing Insight modifier opposes your check."
  ],
  "Keen Eyes": [
    "Your Ranged attacks and spells gain 30 feet of range, you double the range of any special visions, and you can use the Find action as a Quick action.",
    "If you fail a Sense Motive check against a target within 5 feet, use this Talent to gain a success. It's not subtle — onlookers can tell you're suspicious of the target (you choose the visual tell). Once per Intermission."
  ],
  "Linguist": [
    "Spend a Light or Full Rest with a creature speaking a language you don't know, or studying a script you can't read, to gain that language and script. Learning a new one this way replaces the last one you studied."
  ],
  "Look Over There": [
    "Use a Quick action and a Perform check to distract any number of creatures within 60 feet that can hear you (the highest Insight opposes). Not usable on the same creature again for 24 hours.\nSuccess: they can't take Reactions against you until the start of their next turn.\nCritical: you also gain Hidden (lost at end of turn if not obscured from them).\nSupercritical: your allies gain the same benefits and may move up to their Speed during your turn as a Free action."
  ],
  "Luck of the Gods": [
    "After rolling for a Wound or Trauma, use this Talent to turn all those dice into 1s. Once per Light or Full Rest."
  ],
  "Master Spy": [
    "You can mimic the voice of someone you've heard, and over an Intermission turn Luxury Clothes into a Disguise of a specific outfit you've seen."
  ],
  "Min Max": [
    "When you gain this Talent, decrease one Attribute Rank by 1 and increase a different one by 2 (never above 6)."
  ],
  "Mobile": [
    "Increase all your Speeds by 5 feet. This includes any Swim or Fly Speed you have.",
    "Increase all your Speeds by an additional 5 feet.",
    "Increase all your Speeds by an additional 10 feet."
  ],
  "Naturally Gifted": [
    "You get an additional Attribute Point to increase one of your Attribute Ranks. You must spend this Point when you receive it."
  ],
  "Skilled": [
    "You get four additional Skill Points to rank up your Skills. You must spend these Points when you receive them."
  ],
  "Sneaky": [
    "When performing an Ambush, you gain a +2 modifier to the check. When you successfully Ambush, you gain 4 additional successes on your initiative check instead of 2."
  ],
  "Steady Hands": [
    "On a failed Finesse check, you avoid the consequence:\nPicking a pocket: you aren't noticed.\nPicking a lock: you don't break it or trip alarms.\nDisarming a trap: you don't trigger it.\nAfter using one of these, you can't use that same one again until an Intermission (the others stay available)."
  ],
  "Steel Saves": [
    "Choose Endure, Might, Move, or Insight as your Steel Skill: gain a +1 modifier (a Proficiency die) on Skill saves with it.\nIf a negative modifier reduces that save to 0 dice, you roll a Proficiency die instead of the Base die (still can't Push it)."
  ],
  "Strategic Purchase": [
    "As a Standard Action, pull from your backpack one basic piece of Gear (not a weapon, arcane foci, armor, shield, or alchemy item) of Bulky, Light, or Tiny weight, as if you'd always had it — you must afford it and lose that currency now. Custom gear is allowed at the GM's price. Once used, not again until you've visited an area with a general store."
  ],
  "Strong Arm": [
    "The max range of all your Throwing weapons is now 60 feet. If your thrown weapon attack is benefitting from Aim, its range increases to 90 feet."
  ],
  "Sturdy": [
    "Increase your max HP by 4.",
    "Increase your max HP by an additional 8.",
    "Increase your max HP by an additional 12."
  ],
  "Take Your Turn": [
    "When you'd roll initiative, you may choose to fail it. If you do, you gain a +2 modifier on Blocks, Parries, Dodges, and Skill saves until the start of your first turn. If by then you haven't been hit by an Attack or made Restrained, Prone, Impaired, or Unconscious, your next Skill or Spell check on your first turn gains two successes."
  ],
  "Toss a Friend": [
    "As a Standard Action, Grapple a willing ally and throw them up to 10 ft, +5 ft per Rank of Strength above 2, in a direction you choose. They take no damage if they don't fall more than 15 ft and always land on their feet. If they land within 5 feet of a creature, they may use a Reaction to make an Opportunity Strike."
  ],
  "Vigilant": [
    "You and allies within 60 feet gain a +2 modifier on initiative checks. On a failed initiative check, you may choose to gain a success. Once per Light or Full Rest."
  ],
  "Warfare Initiate": [
    "You learn 1 Martial Talent of your choice. You can rank it up with Talent Points, but can't access other Martial Talents without the Fighter or Vagabond Class."
  ],
};

// -- Specialty Talent rank data (verbatim from the Core Rulebook) -------
const SPECIALTY_RANK_DATA = {
  "Guardian": {
    ranks: [
      "You learn one Martial Talent at Rank 1 and gain Armored.",
      "You unlock Stamina, Hardened, and Iron Reflex.",
      "You unlock Defensive Stance.",
      "You unlock Intercept.",
      "You unlock Bulwark."
    ],
    abilities: "Reminder: the order of damage reduction is:\nApply flat damage reduction.\nThen apply effects that halve or quarter the damage.\nThen apply resistances and vulnerabilities.\nArmored: Any armor set you wear has its max DP increased by 5.\nStamina: As a Guardian, you can gain and expend Stamina Points to use Guardian Abilities.\nHardened: While you have Stamina, you reduce all physical damage you receive by an amount equal to double your rank in this specialty talent.\nIron Reflex: When you are targeted by a Melee or Ranged Attack, you can spend 1 Stamina Point to Block or Parry the attack as a Free Action.\nDefensive Stance: When you take physical Damage you can spend 2 Stamina Points as a Free action to enter a Defensive Stance until the start of your next turn. While in Defensive Stance, you halve all physical damage taken but can’t perform Opportunity strikes or other harmful Reactions.\nIntercept: When an ally within half your speed in distance from you is hit by a melee or ranged attack, you can spend 3 Stamina Points as a Free action to run within 5 feet of the ally and minimize the impact, reducing the physical damage they take from the attack by half.\nBulwark: You can use a Quick action to enter this state for 1 minute. When Bulwark is active your Stamina Points refresh at the start of your turn and your abilities gain additional benefits:\nIron Reflex: Your Block or Parry gains a +2 modifier.\nDefensive Stance: You halve any Mental damage as well as Physical.\nIntercept: The ally also benefits from Hardened.\nAfter using Bulwark, you cannot use it again until you finish a Light or Full Rest."
  },
  "Berserker": {
    ranks: [
      "You learn one Martial Talent at Rank 1 and gain Thicker Skin.",
      "You unlock Stamina, Rage and Bolster.",
      "You unlock Rampage.",
      "You unlock Overwhelm.",
      "You unlock Frenzy."
    ],
    abilities: "Thicker Skin: Your Max HP increases by 8.\nStamina: As a Berserker, you can gain and expend Stamina Points to use Berserker Abilities.\nRage: While you have Stamina Points, you gain Temp HP at the start of your turn equal to double your rank in this specialty and the Base damage on Melee Attacks made with Strength increase equal to your rank in this Specialty.\nBolster: When you make a Skill check that uses Strength, you can spend 1 Stamina Point as a Free action to give it a +2 modifier. You can’t use this more than once on the same check.\nRampage: When your HP takes damage, you can spend 2 Stamina Points as a Free action to enter a Rampage until the end of your next turn. While in Rampage, your HP gains resistance to Slash, Pierce, and Blunt damage. This applies to the damage that triggered it.\nOverwhelm: After you attack with a Melee Weapon Attack using Strength, you can spend 3 Stamina Points as a Free action to reroll all the dice that did not roll a success. The base damage of the weapon used is increased by 4 for the attack. You cannot use this on a Pushed check. You cannot use this more than once on the same check.\nFrenzy: You can use a Quick action to enter a Frenzy for 1 minute. While in a Frenzy, your Stamina Points refresh at the start of your turn and your abilities gain additional benefits:\nBolster: The dice you gain from the +2 modifier are proficiency dice.\nRampage: Your HP gains resistance to all damage.\nOverwhelm: The base damage your attack is increased by 8 instead.\nAfter using Frenzy, you cannot enter another Frenzy until you finish a Light or Full Rest."
  },
  "Engineer": {
    ranks: [
      "You learn one Martial Talent at Rank 1 and gain Tinkerer.",
      "You unlock Energy, Inventions, Quick Repair, the Swinger and Barricade Constructs.",
      "You unlock the Medic and Thumper Constructs.",
      "You unlock the Sniper and Trapper Constructs.",
      "You unlock the Project Guardian Construct."
    ],
    abilities: "Tinkerer: You are always considered having a Tool Kit equipped without having to wear one. You can still benefit from another Kit that you have equipped.\nEnergy: As an Engineer, you can gain and expend Energy Points to use Engineer abilities.\nInventions: You gain the ability to create and deploy Battle Constructs you’ve unlocked.\nWhen not deployed, Battle Constructs appear as small handheld cube of gears and metal.\nYou can spend Energy Points to deploy a Battle Construct. Each Battle Construct costs a specific number of Energy Points, a free hand, and a Quick action to deploy. You can only deploy Battle Constructs you’ve unlocked in this Talent. When deploying a Battle construct, you throw the handheld cube and it unfolds into the construct.\nBattle Constructs count as creatures. If subjected to a Skill save, they use a number of Base dice equal to your Rank in this Talent.\nBattle Constructs have immunity to Fear and Psychic damage. They also have immunity to the Bewitched, Blinded, Dazed, Slowed, Poisoned, Prone, and Shocked Conditions.\nYou can deploy a Construct within 15 feet of you. You can have no more than 2 Constructs deployed at once. Each Construct lasts 1 minute, after which they disassemble and are destroyed.\nYou may Activate a deployed construct once as a Free Action on each of your turns.\nIf you deploy a Construct while having two already deployed on the field, the oldest one detonates. When a Construct detonates, it explodes, dealing Fire damage equal to its Energy Point cost multiplied by 4 to all creatures within 5 feet of it. A creature can make a Move save to reduce damage from this explosion.\nYou can manually detonate Constructs as a Quick action. If you manually detonate a Construct, the detonate damage doubles and the explosion radius hits all creatures within 10 feet of it instead.\nIf your Constructs are brought to 0 DP, they are destroyed without being detonated.\nQuick Repair: You may spend a Quick action to touch a creature with an armor set or manufactured armor to spend 1 Energy Point and repair their DP. The recovered DP is equal to your Rank in this Talent multiplied by 4.\nSwinger\nCost: 1 Energy Point.\nSize: Medium\nNatural DP: 20\nActivate: This battle construct moves up to 15 feet and may have it make a Melee Weapon Attack against a creature you choose within 5 feet of it. The Swinger rolls Xd8 for the attack, where X is equal to your Rank in this Talent. The attack deals a base damage of 6 Slash.\nBarricade\nCost: 1 Energy Point\nSize: Large\nNatural DP: Special\nActivate: This battle construct moves up to 15 feet and then you may choose if it transforms into a Wall or Gate. Once transformed, it can’t be activated again.\nWall: the construct transforms to create a solid, reinforced wall that is 5 feet long, 5 feet tall, and 1 foot thick. The wall has a Natural DP of 40 and provides Full Cover.\nGate: The construct transforms and expands up to 10 feet long and 10 feet tall. There are openings to make Ranged Weapon Attacks through the gate, but the gate provides Heavy Cover to any target across it unless the source of the attack is within 5 feet of the gate. The gate counts as a wall for Small or bigger creatures. The Gate has a Natural DP of 20.\nMedic\nCost: 2 Energy Points\nSize: Medium\nNatural DP: 30\nActivate: This battle construct moves up to 30 feet. If it ends its movement within 5 feet of an ally with 0 HP, it heals the ally for an amount of HP equal to your Rank in this specialty multiplied by 4. Once this Construct has healed an Impaired creature three times, it is dismantled and destroyed.\nThumper\nCost: 2 Energy Points\nSize: Medium\nNatural DP: 30\nActivate: This battle construct moves up to 30 feet and may Thump. If it Thumps, each creature within 10 feet of the Thumper takes 12 Force damage as long as the Thumper is on a surface and the creature is also on that surface. A creature may make a Might save to reduce damage. This save has a negative modifier equal to X – 1, Where X is your rank in this specialty.\nSniper\nCost: 3 Energy Points\nSize: Medium\nNatural DP: 50\nActivate: This battle construct moves up to 15 feet and may make a Ranged Weapon Attack against a creature you choose within 120 feet of it. The Sniper rolls Xd8 for the attack where X is equal to your Rank in this Talent. The attack deals a base damage of 8 Pierce and has the Penetrate Feature.\nTrapper\nCost: 3 Energy Points\nSize: Medium\nNatural DP: 50\nActivate: This battle construct moves up to 30 feet and may fire a net at a creature within 5 feet of the Construct. The Trapper rolls 3d8 for the attack, On a hit, the target takes no damage but becomes Grappled by the Trapper and gains the Restrained Condition while Grappled this way. Attempts to Break Free from this Grapple gain a negative modifier equal to X – 1, Where X is your rank in this specialty. Huge or bigger creatures are immune to the Trapper. If the Trapper has a medium or smaller creature grappled, when activated it can drag the creature up to 15 feet.\nProject Guardian\nCost: None\nSize: Huge\nNatural DP: Special\nActivate: The construct does not count against your maximum number of active Constructs. It is instead treated as a Summoned Companion. When summoned, choose either the Shield or Gun variant. You throw a mechanical cube, which transforms into the chosen variant for 1 minute. When the duration ends, Project Guardian powers down and reverts to its cube form. Project Guardian cannot be detonated. If its MP is reduced to 0, it is not destroyed but disabled until it is Galvanized.\nLimitation: It cannot be summoned again until you complete a Light or Full Rest."
  },
  "Pugilist": {
    ranks: [
      "You learn one Martial Talent at Rank 1 and unlock Pugilist Form.",
      "You unlock Stamina, Lightning Stance, Lightning Strikes, Sting, Mountain Stance, Grounded Defense, and Float.",
      "You unlock Wallop and Brace.",
      "You unlock Haymaker and Bob and Weave.",
      "You unlock Iron Tempest."
    ],
    abilities: "You can increase the base damage of your Unarmed Stikes and give them magical properties by wielding Limb Wraps of Uncommon rarity or higher.\nPugilist Form: As a Pugilist, your Unarmed Strikes have a base damage of 6 Blunt. Your hands in Unarmed Strikes count as 1h melee weapons for the sake of Parries, Off-Hand Attacks, and Martial Talents.\nStamina: As a Pugilist, you can gain and expend Stamina Points to use Pugilist Abilities.\nPugilist Stances: When you spend a Quick action to refill your Stamina Points, you must choose to enter either Lightning Stance or Mountain Stance for 1 minute. While in either stance, you have access to some of that stance’s abilities. You unlock their other abilities as you increase your Rank in this specialty. Each time you refill your Stamina Points, you can refresh the duration of the current stance you are in or change to the other.\nIron Tempest: You can use a Quick action to enter Iron Tempest for 1 minute. While in Iron Tempest, your Stamina Points refresh at the start of your turn and you have access to all abilities in both Lightning Stance and Mountain Stance. After using Iron Tempest, you cannot use it again until you finish a Light or Full Rest.\nLightning Stance\nLighting Strikes: While you are in this stance, your unarmed attacks gain a +1 modifier and the Penetrate Feature.\nSting: When you hit with a melee attack, you can spend 1 Stamina Point to follow up with a jab, dealing 6 additional damage. The damage type is the same as your Unarmed Strike’s base damage.\nWallop: You can spend 2 Stamina Points as a Free action on your turn to increase your Unarmed Strike’s base damage by 2 until the start of your next turn.\nHaymaker: When you are benefiting from Wind-Up, you can spend 3 Stamina Points as a Free action to enhance the bonus. The next Unarmed Strike that benefits from that Wind-Up has its Base Damage increased by 8.\nMountain Stance\nGrounded Defense: While you are in this stance, you reduce Slash, Pierce, and Blunt damage you receive by 4 and gain a +1 modifier to Dodge or to Parry with your hands.\nFloat: When you are targeted by a Melee Attack, you can spend 1 Stamina Point as a Free action to Parry the attack.\nBrace: When you take Slash, Pierce, or Blunt damage, you can spend 2 Stamina Points to grant your HP and DP resistance to those damage types until the start of your next turn.\nBob and Weave: When you Parry, Dodge, or make a Move save, you can spend 3 Stamina Points as a Free action to reroll all the dice that did not come up as a success. This cannot be used on a Pushed check. You can’t use this more than once on the same check."
  },
  "Sharpshooter": {
    ranks: [
      "You learn one Martial Talent at Rank 1 and Eagle Eye.",
      "You unlock Focus and the Snipe Shot technique.",
      "You unlock the Buck Shot technique.",
      "You unlock the Homing Shot technique.",
      "You unlock the Deadeye Shot technique."
    ],
    abilities: "Eagle Eye: Your Ranged Weapon Attacks gain 20 feet of range.\nFocus: Sharpshooters gain and can use Focus Points to activate Sharpshooter techniques. You can’t use more than one Technique at once.\nSnipe Shot: You can spend 1 Focus Point as a Free action on your turn to activate this technique. This technique fades after you make a Ranged Weapon Attack or at the end of your turn. While this technique is active:\nIncrease your next Ranged Weapon Attack’s range by 30 feet.\nYour next Ranged Weapon Attack has its base damage increased by double your Rank in this Talent.\nBuck Shot: You can spend 1 Focus Point as a Free action on your turn to activate this technique. This technique fades after you make a Ranged Weapon Attack or at the end of your turn. While this technique is active:\nYou ignore negative modifiers from having a target be within 5 feet on your next Ranged Weapon Attack.\nYour next Ranged Weapon Attack has its base damage increased by double your Rank in this Talent.\nThe target of your next Ranged Weapon Attack cannot use an Opportunity Strike against you until the start of your next turn.\nHoming Shot: You can spend 1 Focus Point as a Free action on your turn to activate this technique. This technique fades after you make a Ranged Weapon Attack or at the end of your turn. While this technique is active:\nYou ignore any negative modifiers from a creature gaining Cover.\nYou ignore any negative modifiers from a creature being Prone.\nYour next Ranged Weapon Attack has its base damage increased by double your Rank in this Talent.\nDeadeye Shot: You can activate this technique after making a successful Ranged Weapon Attack as a Free action. When you activate this technique:\nYou replenish all missing Focus Points.\nYour attack gains 2 additional successes.\nYou can use this with another Sharpshooter technique.\nOnce you’ve used this technique, you cannot use it again until you finish an Intermission."
  },
  "Elemancer": {
    ranks: [
      "You learn one Martial Talent at Rank 1 and Swift.",
      "You unlock Focus and the Gale Force technique.",
      "You unlock the Raging Whirlpool technique.",
      "You unlock the Lightning Strike technique.",
      "You unlock the Blazing Sun technique."
    ],
    abilities: "Swift: Your speed is increased by 5 feet.\nFocus: Elemancers gain and can use Focus Points to use Elemancer techniques. You can’t use more than one Technique at once.\nGale Force: You can spend 1 Focus Point as a Free action on your turn to activate this technique. You can’t use this if you already used another technique this turn. When you activate this technique, you enhance your next strike with a powerful gust of wind. Choose to either Push or Launch when you activate this technique. The technique fades after you make a melee attack or at the end of your turn.\nIf you choose Push, while this technique is active:\nYour next Melee Weapon Attack deals additional Force damage equal to triple your Rank in this Talent.\nYour next Melee Weapon Attack pushes the target back 10 feet. If the target collides with a wall, they fall Prone. If they collide with another creature, the second creature also takes the Force damage.\nIf the creature is two or more sizes bigger than you, then you instead push yourself back 15 feet. This movement doesn’t provoke Opportunity Strikes.\nIf you choose Launch, while this technique is active:\nYou can launch yourself from a wall, ground, or structure up to 15 feet as a Free action once on your turn.\nYour next Melee Weapon Attack during or after using this movement deals additional Force damage equal to triple your Rank in this Talent. If you do any other action or use any other movement you lose this benefit.\nThe movement from launching yourself does not provoke Opportunity Strikes.\nRaging Whirlpool: You can spend 1 Focus Point as a Free action on your turn to activate this technique. You can’t use this if you already used another technique this turn. The technique fades after you make a Melee Weapon Attack or at the end of your turn. While this technique is active:\nYour next Melee Weapon Attack deals additional Frost damage equal to triple your Rank in this Talent.\nAfter you make a successful Melee Weapon Attack, all creatures within your weapon’s reach (except you and the target of your attack) take Frost damage equal to triple your Rank in this Talent.\nEach creature that took Frost damage from this ability has their Speed reduced by 10 feet until the end of their next turn.\nLighting Strike: You can spend 1 Focus Point as a Free action on your turn to activate this technique. You can’t use this if you already used another technique this turn. The technique fades after you make a Melee Weapon Attack or at the end of your turn. While this technique is active:\nIncrease your Speeds by 30 feet, but you can only move in a single direction of your choice until the technique ends.\nYou can move through hostile creatures’ spaces.\nCreatures cannot use an Opportunity Strike against you.\nYour next Melee Weapon Attack deals additional Electric damage equal to triple your Rank in this Talent.\nAll creatures you passed through while this technique is active (except you and the target of your attack) take Electric damage equal to double your Rank in this Talent.\nBlazing Sun: You can activate this technique after making a successful Melee Weapon Attack as a Free action. You can’t use this if you already used another technique this turn. When you activate this technique:\nYou replenish all missing Focus Points.\nEach creature within 10 feet of your target except for you takes 24 Fire damage.\nOnce you’ve used this technique, you cannot use it again until you finish an Intermission."
  },
  "Alchemist": {
    ranks: [
      "You learn one Martial Talent at Rank 1 and gain Mobile Apothecary.",
      "You unlock Energy, Alchemy, and Rank 2 Signature Effects.",
      "You unlock Rank 3 Signature Effects.",
      "You unlock Rank 4 Signature Effects.",
      "You unlock Experimental Serum."
    ],
    abilities: "Mobile Apothecary: You are always considered having an Alchemist Kit equipped without having to wear one. You can still benefit from another Kit that you have equipped.\nEnergy: As an Alchemist, you can gain and expend Energy Points to craft Alchemy items and add Signature Effects to them (see page 119 for details on the Alchemy).\nAlchemy: When Alchemists want to make Alchemy Items:\nDuring an Intermission, you can use Reagents to craft Elixirs, Poisons, and Oils. You follow the same rules for normal Alchemy crafting rules, but your checks gain a positive modifier equal to your rank in this study. You also automatically gain one success at crafting certain rarity alchemy items when you reach certain ranks in this specialty.\nAlchemist Rank\nRarity Auto Success\n2\nCommon\n3\nUncommon\n4\nRare\n5\nMythic\nWhile Alchemists can automatically craft any Alchemy item listed in this book at certain ranks, that doesn’t allow them to automatically craft Alchemy items outside of this book. The GM may require an Alchemist to make a Finesse or Analyze check with a custom difficulty to craft unique Alchemy items they discover, even if the rarity would normally be an auto success.\nBefore you use, consume, or feed another creature an Alchemy item, you can spend Energy Points to add a Signature Effect as a Free Action. A single Alchemy item use can only benefit from one Signature Effect at once. Signature Effects can only be used by the Alchemist that made them. If the item is handed to another creature, the Signature Effect is lost.\nYou may use a Quick action to craft an Emergency Alchemy Item. Emergency Alchemy items cost an amount of Energy to make and expire after 8 hours if not used. You may also add Signature Effects when using Emergency Alchemy items for the appropriate Energy Point costs. You can only make certain Emergency Alchemy items based on your rank in this specialty.\nAlchemy Rarity\nRank Needed\nEnergy Cost\nCommon\n2\n2\nUncommon\n3\n4\nRare\n4\n6\nMythic\n5\n8\nYou may recycle an Alchemy item during an Intermission. When you do you gain a Reagent of one rarity lower than the Alchemy item’s rarity.\nRank 2 Signature Effects\nThese cost 1 Energy Point to activate each.\nContact (Elixirs): You can throw this Elixir up to 30 feet as a Quick Action at another creature you can see. The Elixir breaks and affects the creature as if you fed them the Elixir.\nPotent (Poisons): The target gains an additional -2 modifier on their Skill saves against this Poison.\nBurning (Oils): While this Oil persists, a weapon coated in it deals 2 additional Fire damage and provides 30 feet of light.\nRank 3 Signature Effects\nThese cost 2 Energy Points to activate each.\nHealthy (Elixirs): When you consume or feed this Elixir and it replenishes HP or MP, it replenishes an additional 15 points of the Status Points being affected.\nExplosive (Poisons): You can throw this Poison up to 30 feet as a Quick Action at a surface you see, having it explode in a 5-foot radius sphere. Each creature in the explosion takes 12 Acid damage plus an additional 12 per rarity higher than Common. Creatures that take damage from this can make an Endure save to reduce damage taken. If the damage reduces any creature’s HP, they must make an Endure save against the Poison or be afflicted by it.\nHardened (Oils): While this Oil persists, the base damage of a weapon coated in it is increased by 4.\nRank 4 Signature Effects\nThese cost 3 Energy Points to activate each.\nLucky (Elixirs): When consumed or fed, the target also gains a boon of Luck for 1 minute. When the creature make a Skill check, they can consume the boon of Luck to add 2d8 to their Skill check.\nDeadly (Poisons): The first Endure save against being afflicted by this Poison automatically fails. Mythic creatures can still use Mythic Resistance against this effect to succeed at the save instead.\nCorrosive (Oils): While this Oil persists, a weapon coated in it deals an additional 10 Acid damage to DP.\nExperimental Serum\nThis costs no Energy Points to craft. When you use this trait, roll 1d6 and consult the Experimental Serum table to see which you make. An Experimental Serum expires after 8 hours of no use. After you use this trait, you cannot use it again until after you finish a Light or Full Rest.\n1D6\nResult\n1-3\nElixir of Ironhide (page 120)\n4-6\nLiquid Admanatine (page 122)"
  },
  "Reaver": {
    ranks: [
      "You learn one Martial Talent at Rank 1 and Soulwell.",
      "You unlock Energy, and Reaver Mark.",
      "You unlock Reaver Servant.",
      "You unlock Shroud.",
      "You unlock Reaver’s Reap."
    ],
    abilities: "Soulwell: When a creature dies within 60 feet of you, you can regain 3 Sorce.\nEnergy: As a Reaver, you can gain and expend Energy Points use Reaver abilities.\nReaver Mark: You can spend 1 Energy Point as a Free action on your turn to mark a creature for death with an invisible, magical brand. This brand is your Reaver Mark. The Reaver Mark lasts for 7 days. When you damage a creature that has been marked, you deal additional Necrotic damage equal to double your Rank in this Talent. A creature thus marked cannot hide from you, as you will always know their general direction while the Mark is active. You can only have one Mark up at a time. If you mark another creature with Reaver Mark, the last one is dispelled.\nReaver Servant: You can spend 2 Energy Points as a Quick action to summon a Skeletal Squire to aid you. The Skeletal Squire is treated as a Summoned Companion. If you can see a corpse with the bones of a Medium-sized creature within 15 feet, you may use a Quick action and spend 1 Energy Point to transform that corpse into a Skeletal Squire. The Skeletal Squire lasts for 8 hours. You can only have one Squire summoned at once. If you summon a new Skeletal Squire while already having one, the oldest one is destroyed. When you summon your Skeletal Squire, you may choose to summon either the Archer or Fighter variant.\nShroud: You can spend 3 Energy Points as a Free action on your turn to enter a dark, amorphous, and incorporeal form for 1 minute. This form also transforms your gear as long as it is on your person. While in Shroud, you can fit through openings as small as 1 inch, you are Invisible while in darkness, your HP and DP are resistant to Slash, Pierce, and Blunt damage, your HP and DP are immune to Necrotic damage, and you gain a Fly Speed equal to your base Speed. You are also immune to the Prone, Grappled, and Restrained Conditions. Your next Melee or Ranged Weapon Attack while in Shroud gains a +2 modifier and the next time you deal physical damage you deal 12 additional Necrotic damage. After you make a Melee Weapon Attack, make a Ranged Weapon Attack, or cast a Spell, the effects of Shroud end.\nReaver’s Reap: When you damage a creature marked by your Reaver’s Mark, you can activate this ability as a Free action to temporarily Overcharge the Mark and siphon their life. The additional damage the creature would take from the Mark during this trigger is doubled and you regain 6 Energy Points. If the creature is Bloodied by the end of your attack, you regain all missing Energy Points instead. You cannot use this trait again until you finish a Full Rest."
  },
  "Spellweaver": {
    ranks: [
      "You learn one Sorcery Talent at Rank 1 and Magic Master.",
      "You unlock Focus and Spell Charge.",
      "You unlock Regain Control.",
      "You unlock Empowered Magic.",
      "You unlock Megacharge."
    ],
    abilities: "Magic Master: Whenever you cast a spell that let’s you make a Spell check, you gain a +1 modifier on the spell check.\nFocus: Spellweavers gain and can use Focus Points to activate Spellweaver abilities. You may use more than one Spellweaver ability per spell being cast. You may choose to use these abilities after rolling for a spellcheck.\nSpell Charge: You know how to use your excess magic to fuel future Spells. When you cast a Rank 1 Spell or higher, and that Spell has a Spell check, you can spend 1 Focus Point to gain a +2 modifier on the check.\nWhen you reach Rank 4 in this Specialty, using this ability also transforms the Base die from the modifier into a Proficiency die.\nRegain Control: You can use your excess magic to regain control of your chaotic Spells. When you Overcharge a Spell and roll any 1s, you can spend 1 Focus Point to ignore them.\nEmpowered Magic: You know how to use your excess magic to empower your Spells. When you cast a Spell that forces a Skill save, you can spend 1 Focus Point to have all Skill Saves against the spell gain a -2 modifier.\nMegacharge: Using your mastery over Sorce, you can push Spells beyond their limits. When you cast a Spell at Rank 5 or lower, you can choose to Megacharge it. When you Megacharge a Spell, you can Overcharge it without suffering an Arcane Mishap and then double its Power Levels. You cannot use other Spellweaver abilities on this action, but you regain all missing Focus Points after. Once you use this, you can’t use it again until you finish a Full Rest."
  },
  "Warlock": {
    ranks: [
      "You unlock your Patron’s Gift.",
      "You unlock Warlock Contracts and can gain up to 2 Contracts per Rest.",
      "You can gain up to 4 Warlock Contracts Per Rest.",
      "You can gain up to 6 Warlock Contracts per Rest.",
      "You unlock Patron’s Avatar."
    ],
    abilities: "Patron’s Gift: When you get Rank 1 in this Specialty, you can select one Study of Sorcery and learn Rank 1 in it. By making a pact with a greater Patron, the Study of Sorcery you choose becomes your Patron’s Gift, bestowing access to it and certain effects for that Study. You should work with your GM and pick a Study based on the kind of Patron you choose. A Patron can be a powerful primal, lich, or other entity. Whenever you cast a spell from your Patron’s Gift, it costs 1 less Sorce to cast. This can’t bring the Sorce cost to 0.\nHere are some recommendations for Studies based on example Patrons:\nElemental: A force of nature that has gained sentience; Study of Pyromancy, Cryomancy, Aeromancy, or Geomancy.\nDemonic: A Patron from the Shadow Realms or Dark Arts; Study of Blood, Death, or Contagion.\nAngelic: A Patron from the Divine Realms; Study of Recovery, Divinity, or Pyromancy.\nEldritch: A Patron from the Outerveil or the Void; Study of Shadow, Death, or Displacement.\nIf a contract grants the warlock a spell from a Study of Sorcery they do not possess and that spell utilizes a Spell Check, the Warlock may substitute their rank in that study for their rank in this Specialty Talent for the spell check.\nPatron’s Avatar: You can use a Quick action to become your Patron’s Avatar for 1 minute. Once you’ve used Patron’s Avatar, you cannot use it again until you finish a Light or Full Rest. While in your Avatar form, you gain the following benefits:\nThe Sorce Point cost of casting Spells from your Patron’s Gift is reduced by half.\nWhen you cast a Rank 1 or higher Spell from your Patron’s Gift, the Spell gains an additional 2 Power Levels (if it has Power Levels).\nWhen you cast Rank 0 Spells from your Patron’s Gift that deal damage, their base damage increases by 4.\nYour Avatar form is lost if you become Impaired or spend a Quick action to end it.\nWarlock Contracts\nA Warlock Contract is a deal you strike with your Patron. These deals grant you access to abilities and Features that enhance your character. You can gain a Contract at any point in the day as a Quick action. When you take a Contract, you gain its benefits until you finish a Light or Full Rest. You cannot gain the same Contract again until you finish a Light or Full Rest. Some Contracts require you to have a specific Rank in this Talent to access them.\nEmpowered Magics: Increase the base damage of your Rank 0 Spells by 2.\nPatron Armor: Gain Temp DP equal to double your Wits Rank when not wearing Plate armor. This Temp DP refreshes after not taking damage for 1 minute. When you reach rank 4 in this study, the amount of Temp DP increases to triple your Wits Rank.\nAnimal Speech: You can speak with Beasts.\nBewitching Influence: you gain a +2 modifier to Manipulate checks. You can also change your voice to sound the same as another creature you’ve heard before.\nGift of Sight: You gain Nightvision.\nEmpowered Focus: Gain a +2 modifier on Endure saves to maintain focus on your Spells.\nArcane Understanding: You can read texts from any traditional language. The magic presents these texts in a script you understand, but it does not decipher symbols, sigils, runes, or coded markings.\nEntrusted Servant: You gain a soul bound to assist you on your travels. While you have this Contract, you add the Skeleservant Spell to your Spellbook. This Spell can be prepared without counting against your prepared Spells. When you cast Skeleservant while having this Contract, you do not need to focus on the spell and the servant’s max HP and MP are tripled. When you cast the spell, you may also make it a different Humanoid creature type than an undead skeleton that is appropriate with you Patron. You can only have one cast of this spell active at once. If you cast this spell again while it is currently active, it dispels the last cast.\nArcane Mask: While you have this Contract, you add the Create Disguise Spell to your Spellbook. This Spell can be prepared without counting against your prepared Spells. You can use this Contract to cast the Spell at its lowest Rank without expending Sorce Points. When you cast Create Disguise while having this Contract, you can alter your size to be one size bigger or smaller to replicate the creature you are disguised as.\nOtherworldly Energy: When you expend a Recovery die, it gives you 2 additional Status Points.\nGift of Gloom (requires Rank 3): While you have this Contract, the Terrifying Gloom Spell is always considered prepared without it costing against your prepared Spells. When you cast Terrifying Gloom while having this Contract, you gain Gloom Vision for the duration of the Spell and its shape is increased to a 20-foot radius.\nGift of Gills (requires Rank 3): You can breathe underwater and gain a Swim Speed equal to your base Speed.\nOne With Shadows (requires Rank 3): While in Darkness, you gain the Invisible Condition.\nGift of Undeath (requires Rank 3): While you have this Contract, the Raise Dead Spell is always considered prepared without it costing against your prepared Spells. When you cast Raise Dead while having this Contract, the Raised Undead gains an additional 20 HP and 10 MP. The Revived Undead comes back with its full max HP and MP instead of half.\nGift of Casting (requires Rank 3): This Contract comes with 3 charges. When you cast a Spell with a casting time of Standard action from your Patron’s Gift, you can expend one of this Contract’s charges to change the casting time from a Standard to Quick action. When you do, you can’t cast the same spell again in the same turn.\nGift of Overcharge (requires Rank 4): This Contract comes with 3 charges. When you make a Spell Check for a Spell from your Patron’s Gift, you can expend one of this Contract’s charges to reroll up to three of the dice in the Spell check.\nElemental Affinity (requires Rank 4): Choose one damage type between Fire, Frost, Electric, or Acid. Your HP gains resistance to the damage type chosen. You can take this Contract again for additional resistances.\nGift of Flight (requires Rank 4): You can use this Contract to summon two bat-like or angelic wings as a Quick action. These wings grant you a Fly Speed equal to your base Speed. You can dispel the wings as a Free action.\nPatron Recovery (requires Rank 4): When you gain this Contract, you regain up to 10 Recovery Dice.\nGift of Power (requires Rank 4): Rank 1 and higher Spells you cast from your Patron’s Gift gain 2 additional Power Levels. When you reach Rank 5 in this Specialty, they gain 4 additional Power levels instead.\nGift of Immunity (requires Rank 5): You are immune to Diseases and Poisons. If you currently have a Disease, it is not cleansed but suppressed while this Contract is active.\nForced Influence (requires Rank 5): While you have this Contract, the Bend Blood Spell is always considered prepared without it counting against your prepared Spells. When you cast Bend Blood while having this Contract, you can use the Body Control property of the Spell as a Quick action instead of a Standard action, but only once per turn.\nGifted Sorce (Requires Rank 5): You can use this Contract to regain 30 Sorce Points.\nRevitalizing Gift (Requires Rank 5): When you start your turn with 0 HP or 0 MP while having this Contract, you can regain up to 30 HP or 30 MP. This effect works once per Contract. To use it again, you must take the Contract again.\nEldritch Understanding (requires Rank 5): You can read any text written in the Exotic languages listed within this book. Anything originating from beyond the Veil is subject to your GM’s discretion. The magic presents these texts in a script you understand, but it does not decipher symbols, sigils, runes, or coded markings."
  },
  "Oracle": {
    ranks: [
      "You learn one Sorcery Talent at Rank 1 and Sorce Sense.",
      "You unlock Stamina, Future State, Second-Sight Reflexes, Sorce State, Arcane Sight, Enhanced Defense, and Enhance Magic.",
      "You unlock Vigilance and Disrupt Arcane.",
      "You unlock Tip the Scales and Sorcery Shield.",
      "You unlock Time and Space."
    ],
    abilities: "Sorce Sense: You can see if a creature or object is emitting magic and make an Analyze check to discern the nature of the magic. The GM may impose a Difficulty for these checks. You also gain a +1 modifier on Initiative checks.\nStamina: As an Oracle, you can gain and expend Stamina Points to use Oracle abilities. You can use a Quick action to regain all lost Stamina Points.\nOracle States: Your maximum Stamina Points equals twice your Rank in this specialty. Whenever you gain Stamina Points, choose to enter either Sorce State or Future State. While in a state, you gain that state’s passive (Second-Sight Reflexes or Arcane Sight) and access to its abilities. After you’ve been out of combat for 1 minute, your Stamina Points fall to 0 and you exit your state unless you actively refresh it. While you have Stamina Points, other creatures can tell you’ve entered a state from the chromatic magic glinting in your eyes.\nTime and Space: You can use a Quick action to enter a heightened state for 1 minute. During this time, you refresh your Stamina Points at the start of each of your turns and have access to both Sorce State and Future State passives and abilities. While this is active, being at 0 Stamina Points does not cause you to lose your states’ passives. Once you use Time and Space, you can’t use it again until you finish a Light or Full Rest.\nFuture State\nSecond-Sight Reflexes (Passive): While in this state, you gain a +1 modifier to Blocks, Parries, Dodges, and Skill saves, and you gain one extra Reaction each round.\nEnhanced Defense: When you Dodge, Block, or Parry, you may spend 1 Stamina Point as a Free action to reroll one die on that check. This is not usable on Pushed checks and can only be used once per check.\nVigilance: When you or a creature you can see is targeted by an attack, you may spend 2 Stamina Points to allow that creature to Dodge, Parry, or Block as a Free action against that attack. Using this on yourself is a Free action; using it on another creature costs a Reaction.\nTip the Scales: When you or a willing creature you see within 30 feet attempts a Skill save, you may spend 3 Stamina Points to allow that creature to reroll up to two dice on that save. You can only use this once per save and can not use it on a Pushed check. Using this on yourself is a Free action; using it on another creature costs a Reaction.\nSorce State\nArcane Sight (Passive): You can see if a creature or object is Cursed and learn the nature o the Curse (you can’t learn how to cure it). When making any check to see through a potential illusion made by magic, gain a positive modifier to the check equal to your rank in this Study. You see creatures made invisible by magic.\nEnhance Magic: Whenever you or a willing creature you can see within 30 feet makes a Spell check, you may spend 1 Stamina Point to reroll one die on that check. You can’t use this on an Overcharged check, and can only use it once per Spell check. Using this on yourself is a Free action; using it on another creature costs a Reaction.\nDisrupt Arcane: As a Standard action, you can spend 2 Stamina Points to attempt to disrupt a Spell or ongoing magical effect (duration longer than Instant). Make a check using your Wits and your rank in this specialty. This check is treated like a Skill check for the purposes of Pushing and other abilities that can manipulate Skill Checks.\nAgainst a Spell: Apply a -1 modifier for each Rank the Spell is cast at. On a success, you dispel it.\nAgainst a magical effect: the GM sets a custom Difficulty and may introduce a Danger as backlash. On a success, you suppress the effect for up to 1 minute or until you stop suppressing it.\nIf you fail, you can’t attempt this again on the same magical effect or Spell (that specific cast of it) until you finish an Intermission.\nSorcery Shield: When you would make a Skill save against a Spell or magical effect, you may spend 3 Stamina Points as a Reaction to replace your save’s dice pool with 6d8. This check still gains any negative modifiers inflicted on the save or from the Difficulty and is treated like a Skill check for the purposes of Pushing and other abilities that can affect Skill Checks.\nOn a success, you are immune to that Spell or effect until the end of your next turn. You can’t use this against Forbidden Spells. If you use this against a different Spell/effect, the previous immunity ends early."
  },
  "Witch": {
    ranks: [
      "You learn one Sorcery Talent at Rank 1 and Summon Familiar.",
      "You unlock Energy, and Enchanting Charm.",
      "You unlock Brewing and Share Senses.",
      "You unlock Jinx and Familiar Flight.",
      "You unlock Voodoo Doll."
    ],
    abilities: "Summon Familiar: During an Intermission, you can summon a loyal servant. Choose between the Avian Mammal/Reptile, or Aquatic Familiar. The Familiar’s physiology can look like any Beast as long as it follows the template you choose. You can change the Familiar’s template and physiology over the course of an Intermission. You can telepathically speak with your Familiar if it is within 60 feet of you. You can also cast Spells from your Familiar as if you were in its position, but you must have sight of the direction or target of the Spell. If a Familiar is killed, it will need to be resummoned during an Intermission.\nEnergy: Witches gain and can spend Energy Points to fuel their Witch Hex abilities.\nEnchanting Charm: You can spend 1 Energy Point and a Quick action to create a small charm, be it a bracelet or necklace. When you create the charm, you can have it already equipped on a creature you can see within 30 feet of you. Select an ingredient between cat whisker, wolf fang, falcon feather, or fish scales when you make the charm. A creature can only benefit from one charm at a time, and the charm’s magic lasts 1 hour. The charms grant the following effects when worn:\nCat Whisker: Gain Nightvision.\nWolf Fang: Your Melee or Ranged Weapon Attacks base damage are increased by 2.\nFalcon Feather: Increase your Speed by 10.\nFish Scales: Gain the ability to breathe in both air and water and a Swim speed equal to your base speed.\nBrewing: You gain the unique ability to craft Elixirs through your in-depth study of witchcraft. You can spend 2 Energy during an intermission to craft an elixir, during which your Familiar transforms into a cauldron to assist. Select one or more Elixirs from your known Brew List. The contents of the cauldron transmute into the chosen brew, automatically bottling itself in a conjured flask. Upon consumption of the brewed Elixir, the glass flask vanishes. Should the brewing process be disrupted for any reason, the Energy Points expended are preserved.\nName\nEffect\nMidnight Whispers\nFor 1 hour, you gain the ability to speak with Beasts. If you can already speak with Beasts, this grants you a +2 modifier on social checks with Beasts instead.\nArcane Alcohol\nRegain up to 10 Sorce Points but become Tipsy for 1 minute. While Tipsy, you gain a -2 modifier on Agility checks.\nShadow Tears\nFor 1 hour, you become Invisible. You lose the Invisible Condition if you attack or cast a Spell.\nYou can also craft regular Alchemy items using the standard crafting rules, but substitute the Alchemy Kit with your familiar’s cauldron form without expending any Energy. You also gain a +2 modifier on all checks to craft Alchemy items.\nShare Senses: When your Familiar is alive and in the same realm, you can use a Quick action to enter a meditative state for up to 1 hour. While in this state, you can see, hear, and speak through your Familiar. You cannot cast Spells while using Share Sense but can continue to focus on Spells. You can use a Quick action to leave your meditative state. While using Share Senses, your body is considered Unconscious.\nJinx: When you see a creature succeed with one success or fail a Skill check within 60 feet of you, you can use your Reaction and spend 3 Energy Points to Jinx that check. When you Jinx a check, you apply Bane if it was a successful check or Boon if it was a failed check. You can’t use this on a check that was Pushed.\nBane: Reroll a die that came up as a success. If it was a Proficiency die, it is also transformed into a Base die.\nBoon: Reroll up to 3 dice that did not come up as a success. If they are Base dice, they are transformed into Proficiency dice\nFamiliar Flight: While your Familiar is within 30 feet of you, you can use a Quick action to transform it into a Witch Broom form or back to its normal form. While in Broom Form, the Familiar becomes a magical wooden broom with a Fly Speed of 40 feet. It can have up to two Medium-sized creatures mounted on it. The Familiar’s HP, DP, and MP remain the same as its normal form and is still treated as a companion, but can’t attack and all physical damage it receives is halved.\nVoodoo Doll: You can use a Quick action to conjure three enchanted dolls with 3 enchanted pins in a location of your choice on either doll. When the dolls are summoned, you bind each to an ally or enemy you can see within 120 feet. You can use a Minor action to change the location of a pin. Only one pin can affect one of the doll’s locations at once. The dolls lasts for 1 minute. You can use a Quick Action to change the creature a doll is bound to. You can’t use Voodoo Doll again until you finish a Light or Full Rest.\nAlly\nHead\nGain +2 to Wits checks and resistance to Fear damage.\nArms\nIncrease their Melee and Ranged attack’s Base damage by 4.\nBody\nIncrease size by 1 up to Huge.\nLegs\nGain 10 feet of Speed and +2 to Move saves.\nEnemy\nHead\nGain -2 to spell checks and take 4 Psychic damage at the start of their turns.\nArms\nGain a -3 modifier to Melee or Ranged Weapon Attacks.\nBody\nDecrease size by 1 up to Small.\nLegs\nLose 10 feet of Speed and apply a -2 modifier to Move saves.\nWitch Familiars"
  },
  "Shapeshifter": {
    ranks: [
      "You learn one Sorcery Talent at Rank 1 and Animal Form.",
      "You can now make Tiny and Medium Animal Forms. You also unlock Energy, Shapeshifting, and can have up to 2 Beast Traits per Animal Form.",
      "You can have up to 4 Beast Traits per Animal Form.",
      "You can have up to 6 Beast Traits per Animal Form.",
      "You unlock Chimera Form."
    ],
    abilities: "Animal Form: As a Standard action, you can create and activate an Animal Form for 24 hours. When you create an Animal Form, follow the guidelines on the next page. You can only choose a Size Small until you gain Rank 2 in this specialty.\nOnce an Animal Form is created and active, you are in a Hybrid Shape. You can use a Quick action to transform into Beast Shape or back into Hybrid Shape.\nWhile in a Hybrid Shape, you are still Humanoid and can talk, cast Spells, and use your other character abilities. Only your appearance slightly changes.\nWhile in Beast Shape, you transform yourself and all your equipment into a Beast relating to your active Animal Form. You can have the Beast resemble another Beast you’ve seen or be completely unique. You can also replicate the sounds and actions of other Beasts you’ve seen.\nWhile in Beast Shape, you retain your HP, MP, DP, Skill Ranks, Wits Rank, and Empathy Rank. The Beast Shape determines your Strength Rank, Agility Rank, size, traits, Speed, and attacks. Traits and abilities from Talents carry over unless they change your Strength or Agility Attribute Ranks. Traits from your Lineage do not carry over.\nWhile in Beast Shape, Leather armor still uses your Hybrid Shape’s Agility Rank for DP, and Plate armor still uses your\nHybrid Shape’s Strength Rank for any requirement needed to wear.\nWhile in Beast Shape you cannot wield weapons, shields, put on Beast armor, or cast Spells. You can maintain focus on a Spell and any armor you were wearing from your Hybrid Shape is retained for the purpose of DP. You may use magical properties of your armor while in Beast Shape.\nYou cannot speak any languages while in Beast Shape, but you can understand any languages spoken that your character knows.\nYou cannot have more than one Animal Form active at once. If you create another Animal Form while one is active, you lose your current Animal Form.\nEnergy: Shapeshifters gain and can spend Energy Points to fuel their Shapeshifting.\nShapeshifting: Shapeshifters can spend Energy Points to enhance their Animal Forms.\nWhen you create an Animal Form, you can add Beast Traits to Animal Form. You can only have a certain amount of Beast Traits active at once per form based on your Rank in this Talent. Each Beast Trait costs 1 Energy Point to gain.\nYou can’t take the same Beast Trait more than once in the same Animal Form.\nWhen you create an Animal Form, you gain 5 Temp HP per Beast Trait activated on it. These Temp HP replenish after you finish an Intermission. This Temp HP is active in your Hybrid Shape and Beast Shape.\nIf you create another Animal Form while one is active, you lose your current Beast Traits and have to spend Energy to regain them.\nChimera Form: You summon all the natural energies from the wild into yourself. When you enter Chimera Form, you create an Animal Form with up to 8 Beast Traits. You do not need to spend Energy Points on these Beast Traits. After 1 minute, you exhaust your Chimera Form and lose the Animal Form from it. Chimera Form can’t be used again until you finish a Light or Full Rest.\nCreating an Animal Form\nWhen you create an Animal Form, you must first select the Beast Shape’s size. These sizes do not cost any Energy Points and determine your Beast Shape’s core stats.\nBeast Size\nStrength Rank\nAgility Rank\nBase Damage\nTiny\n0\n6\n2\nSmall\n2\n5\n6\nMedium\n4\n4\n8\nYour Beast Shape always starts with 40 feet of Speed and 4 limbs. You will also create one basic melee attack as a Natural Weapon (page 111), choosing either Blunt, Pierce, or Slash for its base damage type. Once you unlock Shapeshifting, some Beast Traits can grant you new options.\nShapeshifting: Beast Traits\nAggressive: Your Beast Shape can use a Quick action to move up 30 feet toward a hostile creature without spending your Speed.\nBalanced: Your Beast Shape gains a +2 modifier against effects that would force your movement or knock you Prone.\nBlood Frenzy: Your Beast Shape’s basic attack deals 4 additional damage to Bloodied creatures.\nBurrower: Your Beast Shape can use a Quick action to burrow. When it burrows, it can move up to 15 feet through earth that is not reinforced or made of metal. Every 5 feet of movement it makes through earth creates a tunnel of equal size to the Beast Shape’s size.\nCharge Attack: Your Beast Shape’s attack deals 4 additional damage if you moved at least 15 feet in a straight line before attacking your target.\nClimber: Your Beast Shape’s Speed is reduced to 30 feet but you gain a 30-foot Climb Speed. You cannot take Swimmer or Flier with this Beast Trait.\nGrappling Strikes: Your Beast Shape can attempt to Grapple a creature as a Free action if it hits the creature with a melee attack.\nKeen Senses: Your Beast Shape gains a +2 modifier on Scout and Survival checks.\nNightvision: Your Beast Shape gains Nightvision.\nPack Mule: Your Beast Shape gains a +2 modifier to Might and Endure checks and its pushing, lifting, and pulling limitation is doubled. It can carry two Oversized items at once.\nPack Tactics: Your Beast Shape gains a +1 modifier for each ally within 5 feet of your attack’s target.\nPounce: Once per turn, your Beast Shape can use a Quick action to leap up to 15 feet without spending any Speed. This movement does not provoke Opportunity Strikes. If you make a melee attack at the end of your leap, your attack deals an additional 4 damage of its base damage type if you leaped the full 15 feet.\nSnake Body: Your Beast Shape loses its limbs but increases its Speed by 10 feet.\nStalker: Your Beast Shape gains a +2 modifier on Hide and Move checks.\nVenomous: When your Beast Shape’s attack reduces a creature’s HP, that creature gains the Poisoned condition until the start of your next turn\nWeb: Your Beast Shape gains 5 Web Charges. It can use a Standard action to expend a Web Charge and shoot a web on a surface or at a creature. You do not regain Web Charges unless you activate another Animal Form and regain this Beast Trait.\nIf at a creature: Make a Shoot check. On a hit, the creature is Restrained by the web. The creature can attempt a Might check as a Standard action to Break Free from the web. Creatures larger than you are immune to this.\nIf on a surface: The web covers a surface area in webbing, making it a difficult surface. The web can also catch fire for 1 minute. If on fire, it is no longer a difficult surface but deals 4 Fire damage to creatures that enter it for the first time since the end of their last turn. The size of the area is equal to 5 square feet, increased by 5 square feet for each size your Beast Shape is greater than Small.\nAmphibious (requires Rank 3): Your Beast Shape can breathe in both air and water.\nCamouflage (requires Rank 3): Your Beast Shape can use a Quick action to become Invisible. It loses the Invisibility if it attacks, casts a Spell, makes a noise, or moves.\nLarge (requires Rank 3): Choosing this trait changes your Beast Shape’s size to Large and grants the following changes to its core stats:\nBeast Size\nStrength Rank\nAgility Rank\nBase Damage\nLarge\n6\n2\n10\nNatural Silver (requires Rank 3): Your Beast Shape’s attacks are treated as if they are Silvered to overcome resistances and immunities.\nPredator (requires rank 3): Your Beast Shape’s melee attacks have their base damage increased by 2.\nSwimmer (requires Rank 3): Your Beast Shape’s Speed is reduced to 20 feet but you gain a 40-foot Swim Speed. You cannot take Climber or Flier with this Beast Trait.\nTentacles (requires Rank 3): Your Beast Shape gains 2 tentacles that have a 10-foot reach. You may make attacks and Grapple with these tentacles. You can also sacrifice your Beast Shape’s 4 limbs to have 8 tentacles instead. Doing so reduces all your Beast Shape’s Speeds by half. Having 8 tentacles also prevents you from having the Flier trait.\nTough (requires Rank 3): Your HP gains resistance to one of the following types when you select this trait and are in Beast Shape:\nSlash\nPierce\nBlunt\nBlind Sight (requires Rank 4): Your Beast Shape gains Blind Vision.\nBrute (requires Rank 4): Your Beast Shape’s melee attacks have their base damage increased by 4.\nFerocious (requires Rank 4): When your Beast Shape uses its attack, it can use it again on the same turn as a Quick action with a -3 modifier.\nFlier (requires Rank 4): Your Beast Shape’s Speed is reduced to 20 feet but you gain a 40-foot Fly Speed. You cannot take Climber or Swimmer with this Beast Trait.\nFly By (requires Rank 4): This trait requires the Flier trait. When your Beast Shape uses its Fly Speed, it does not provoke Opportunity Strikes.\nHuge (requires Rank 4): Choosing this trait changes your Beast Shape’s size to Huge and grants the following changes to its core stats:\nBeast Size\nStrength Rank\nAgility Rank\nBase Damage\nHuge\n8\n0\n12\nArmored Shell (requires Rank 4): Your Beast Shape takes 12 reduced physical damage to a minimum of 1, but its speed is reduced by 10 feet.\nSlippery (requires Rank 4): When your Beast Shape is Grappled, it can spend a Quick action to end the Condition on itself. It can also fit into openings as if it was one size smaller."
  },
  "Summoner": {
    ranks: [
      "You learn one Sorcery Talent at Rank 1 and gain Spirit Companion and your Spirit Companion unlocks the Scout Stage 1 Form.",
      "You unlock Stamina and Command-Dodge and your Spirit Companion unlocks the Hunter and Warden Stage 1 Forms",
      "You unlock Command-Resist and your spirit evolves its Forms into Stage 2.",
      "You unlock Command-Push Limits and your spirit evolves its Forms into Stage 3.",
      "You unlock Unity Apex."
    ],
    abilities: "Stamina: As a Summoner, you can gain and expend Stamina Points to use Summoner Commands.\nCommand-Dodge: When your summoned companion would be targeted by a Melee or Ranged attack, you can spend 1 Stamina as a Free Action to oppose the attack with your Tame, commanding the beast to dodge.\nCommand-Resist: When your summoned companion would make a Skill Save, you can spend 2 Stamina as a Free Action to substitute the creature’s Skill dice with your Tame dice pool.\nCommand-Push Limits: When your summoned companion fails a skill check, you can spend 3 stamina as a Free Action to make a Tame check, using your result as the new check. You can only use this once per check.\nUnity Apex: You can use a Quick Action to transform your spirit into its Apex Form and enter a Packbound Stance for 1 minute. While in a Packbound Stance, your Stamina Points are refreshed and refresh at the start of your turn.\nAfter using Unity Apex, you cannot use it again until you finish a Light or Full Rest\nSpirit Companion: When you summon your spirit into an Animal Form, pick from a template your spirit has unlocked in this Specialty. Your spirit follows these rules:\nYou can choose how the Form looks and its physiology as long as it follows the template and the traits that you pick. This Spirit’s form can resemble an existing animal or look like a new species. When summoned, this creature is considered a Beast and cannot be recognized as a spirit without magic.\nWhen not summoned, your Spirit Companion returns to the Shroud and cannot assist you. If your Spirit Companion is destroyed, you can bond with a new spirit over the course of a Light or Full Rest.\nDuring Intermissions, you can summon the Spirit Companion, transform it into a different form/type, or fully heal the Spirit Companion and clear its Doom stacks.\nYour Spirit Companion shares initiative with you, performing actions and movements on your turn. You may split when your actions and your Spirit Companion’s actions are performed.\nYour Spirit Companion remains summoned until it dies or you dismiss it as a Quick Action. At that time, it loses its physical form and returns to the Shroud.\nYou can’t equip Beast Armor on your Spirit Companion. Some forms come with their own Beast Armor bonded to the creature.\nThe Spirit Companion’s stat blocks evolve into stronger forms as you gain ranks in this specialty, specified by their Stage 1, Stage 2, and Stage 3 title.\nYour spirit’s Apex Form is a temporary form that only lasts for 1 minute after using Unity Apex. While transformed, it regains all its status points and clears any Doom Stacks it had. After 1 minute, it reverts to the Form it was in before as if it was resummoned. If it is killed it instead returns to the Shroud.\nStage 1 Forms\nStage 2 Forms\nStage 3 Forms"
  },
  "Sonneteer": {
    ranks: [
      "You learn one Sorcery Talent at Rank 1 and Rally.",
      "You unlock Focus, Inspire, and Guiding Words.",
      "You unlock Insult and Motivating Melody.",
      "You unlock Distract and Echoing Voice.",
      "You unlock Maestro’s Gambit."
    ],
    abilities: "Rally: You can spend a Quick Action to give another creature that can hear you a +1 modifier on their next Skill Check.\nFocus: Sonneteers gain and can use Focus Points to use Sonneteer techniques.\nInspire: When a creature you can see within 15 feet of you attempts a Skill Check, you can spend 1 Focus Point as a Free Action to inspire the creature with enchanted words. The creature must be able to hear you but does not need to understand you.\nYou grant them an extra Proficiency die as a special +1 modifier.\nIf they are already benefitting from a +6 modifier, you may replace one of their Base dice for the Proficiency die.\nYou can’t use this if the creature has already attempted the check.\nGuiding Words: While within 15 feet of a creature that can understand you, you can use your Perform when you use the Assist action regardless of the skill the other creature is attempting. You can’t do this again until you finish an Intermission.\nInsult: When a creature you can see within 15 feet of you attempts a Skill Check, you can use a Reaction to spend 1 Focus and inflict a -2 modifier on the check. The creature must be able to hear you but does not need to understand you.\nMotivating Melody: During an Intermission or Light Rest, select any number of creatures of your choice that are sharing the same Intermission or Rest to uplift their spirits. For each Recovery die a chosen creature spends during that Intermission or Rest, they regain an extra 2 Status Points. You also benefit from this ability when it is used.\nDistract: When a creature you see within 30 feet of you attempts to use a Reaction, you can spend a Focus Point as a Free Action to attempt to Distract them. Make a Perform check, the target can oppose with Insight. On a success, the target’s Reaction fails and is lost.\nEchoing Voice: You can Galvanize creatures up to 30 feet away. Your Inspire and Insult abilities also have their range increased to 30 feet.\nMaestro’s Gambit: You can use a Quick action to enter this stance for 1 hour. While Maestro’s Gambit is active your abilities gain additional benefits:\nInspire, Insult, and Distract have their ranges increased to 60 feet.\nInspire: This now gives up to 2 Proficiency dice as a special +2 modifier.\nInsult: This now inflicts a -4 modifier.\nDistract: This can no longer be Opposed.\nAfter using Maestro’s Gambit, you cannot use it again until you finish a Light or Full Rest."
  },
  "Cleric": {
    ranks: [
      "You learn one Sorcery Talent at Rank 1 and Blessed Recovery.",
      "You unlock Energy and Blessed Restoration.",
      "You unlock Purification.",
      "You unlock Aegis Intervention.",
      "You unlock Divine Intervention."
    ],
    abilities: "Blessed Recovery: During an Intermission or Light Rest, for each Recovery die that you and any number of creatures of your choice sharing that Intermission or Light Rest, you can’t roll lower than 3.\nEnergy: Clerics gain and can use Energy Points to reinvigorate and bless their allies.\nBlessed Restoration: You can use a Quick action to spend 1 Energy Point and bless a creature you see within 30 feet, replenishing HP or MP equal to triple your rank in this specialty.\nPurification: You can use a Quick Action and Spend 2 Energy to bless a creature within 30 feet and cleanse them of one of the\nfollowing conditions:\nEnraged\nBlinded\nDazed\nShocked\nAegis Intervention: When a creature within\n120 feet of you would gain a Wound or Trauma, you may spend 3 Energy as a Free Action to remove up to two of the dice used to determine the Wound or Trauma. If this reduces the dice rolled to 0, then the die result automatically becomes 1 instead. This can be used after the dice have been rolled and determined.\nIf the target is an NPC and would gain one or more Doom Stacks, you instead reduce the amount of Doom Stacks the creature gains by 1 to a minimum of 0.\nDivine Intervention: Whenever you or another creature within 120 ft. of you that you can see makes a skill save, you can spend a Reaction to tip the scales of fate in their favor.\nThe creature’s save gains 3 successes. You can choose to use this after the creature has\nrolled their dice. You cannot use this\nability on the same creature again\nuntil you finish a Light or Full Rest"
  },
};

const RELIABLE_ATTRIBUTE_TEXT = "Reliable Attribute: Whenever you make a Skill or Spell Check with this Attribute, you may choose to add 1 success after you see the result of the roll. You can’t use this on a Pushed check, can’t use it more than once on a single check, and can’t use it again until you finish a Light or Full Rest unless you pay 20 Sorce.";
const LEVEL19_RECOVERY_TEXT = "All Recovery Dice are now d8s instead of d6s.";

// -- Condensed Specialty summaries for the PDF (per rank; long lists point to the book) --
const SPECIALTY_PDF_SUMMARY = {
  Guardian: [
    "Learn 1 Martial Talent. Armored: armor sets you wear gain +5 max DP.",
    "Stamina: Gain and expend Stamina Points to use Guardian Abilities.\nHardened: While you have Stamina, reduce all physical damage you take by {rank2}.\nIron Reflex: Spend 1 Stamina Point to Block or Parry a Melee or Ranged Attack as a Free Action.",
    "Defensive Stance: When you take physical damage, spend 2 Stamina Points (Free action) to halve all physical damage taken until the start of your next turn. You can't make Opportunity Strikes or other harmful Reactions while in it.",
    "Intercept: When an ally within half your Speed is hit by a melee or ranged attack, spend 3 Stamina Points (Free action) to move within 5 feet of them and halve the physical damage they take.",
    "Bulwark: Quick action; lasts 1 minute. Your Stamina refreshes at the start of your turn, Iron Reflex grants a +2 modifier, Defensive Stance works against all damage types, and allies you Intercept benefit from Hardened. Once per Light or Full Rest."
  ],
  Berserker: [
    "Learn 1 Martial Talent. Thicker Skin: +8 max HP.",
    "Stamina: Gain and expend Stamina Points to use Berserker Abilities.\nRage: While you have Stamina, gain {rank2} Temp HP at the start of your turn, and Strength Melee Attacks deal +{rank} base damage.\nBolster: Spend 1 Stamina Point (Free action) for a +2 modifier on a Strength Skill check.",
    "Rampage: When your HP takes damage, spend 2 Stamina Points (Free action) to gain resistance to Slash, Pierce, and Blunt damage (including the triggering damage) until the end of your next turn.",
    "Overwhelm: After a Strength Melee Weapon Attack, spend 3 Stamina Points (Free action) to reroll all dice that didn't succeed; the weapon's base damage is +4 for the attack. Not on Pushed checks or more than once per check.",
    "Frenzy: Quick action; lasts 1 minute. Your Stamina refreshes at the start of your turn, Bolster's bonus dice become d8s, Rampage resists all damage, and Overwhelm gives +8 base damage instead. Once per Light or Full Rest."
  ],
  Engineer: [
    "Learn 1 Martial Talent. Tinkerer: always count as having a Tool Kit equipped.",
    "Energy: Gain and expend Energy Points to use Engineer abilities.\nInventions: Create and deploy Battle Constructs you've unlocked (see page 69 for Energy and Inventions). Unlock the Swinger and Barricade Constructs.",
    "Unlock the Medic and Thumper Constructs.",
    "Unlock the Sniper and Trapper Constructs.",
    "Unlock the Project Guardian Construct."
  ],
  Pugilist: [
    "Learn 1 Martial Talent. Pugilist Form: Unarmed Strikes deal 6 Blunt & count as 1h melee weapons.",
    "Stamina: Gain and expend Stamina Points to use Pugilist Abilities.\nStances: When you refill Stamina, enter Lightning Stance or Mountain Stance.\nLightning Strikes (Lightning Stance): Unarmed attacks gain a +1 modifier and Penetrate.\nSting (Lightning Stance): On a melee hit, spend 1 Stamina Point to deal 6 extra damage of the same type.\nGrounded Defense (Mountain Stance): Reduce Slash/Pierce/Blunt damage taken by 4; +1 modifier to Dodges and Parries.\nFloat (Mountain Stance): Spend 1 Stamina to Parry as a Free Action instead of a Reaction.",
    "Wallop (Lightning Stance): Spend 2 Stamina Points (Free action) to increase your Unarmed Strike's base damage by 2 until the start of your next turn.\nBrace (Mountain Stance): When you take Slash/Pierce/Blunt damage, spend 2 Stamina Points (Free action) to grant your HP and DP resistance to those until the start of your next turn.",
    "Haymaker (Lightning Stance): When your Unarmed Strike has Wind-Up, spend 3 Stamina Points (Free action) for +8 base damage.\nBob and Weave (Mountain Stance): When you Parry, Dodge, or make a Move save, spend 3 Stamina Points (Free action) to reroll all dice that didn't succeed. Not on Pushed checks or more than once per check.",
    "Iron Tempest: Quick action; lasts 1 minute. Your Stamina refreshes at the start of your turn and you can use all abilities of both Lightning Stance and Mountain Stance. Once per Light or Full Rest."
  ],
  Sharpshooter: [
    "Learn 1 Martial Talent. Eagle Eye: Your Ranged Weapon Attacks gain 20 feet of range.",
    "Focus: Gain and use Focus Points for Sharpshooter techniques. Only one Technique at a time; it fades after a Ranged Weapon Attack or at the end of your turn.\nSnipe Shot: Spend 1 Focus Point (Free action). Your next Ranged Weapon Attack gains +30 feet range and +{rank2} base damage.",
    "Buck Shot: Spend 1 Focus Point (Free action). You ignore within-5-feet penalties on Ranged Weapon Attacks, your next target can't Opportunity Strike you until the start of your next turn, and your next Ranged Weapon Attack gains +{rank2} base damage.",
    "Homing Shot: Spend 1 Focus Point (Free action). You ignore penalties from a target's Cover or being Prone, and your next Ranged Weapon Attack gains +{rank2} base damage.",
    "Deadeye Shot: After a successful Ranged Weapon Attack (Free action), replenish all missing Focus Points and the attack gains 2 additional successes; usable alongside another technique. Once per Intermission."
  ],
  Elemancer: [
    "Learn 1 Martial Talent. Swift: +5 Speed.",
    "Focus: Gain and use Focus Points for Elemancer techniques. Only one Technique at a time; it fades after a melee attack or at the end of your turn.\nGale Force: Spend 1 Focus Point (Free action); choose Push or Launch.\nPush: Your next Melee Weapon Attack deals +{rank3} Force damage and pushes the target 10 feet. Hitting a wall knocks them Prone; hitting a creature deals the Force damage to it too. If the target is 2+ sizes larger, you push yourself back 15 feet instead. This movement doesn't provoke Opportunity Strikes.\nLaunch: Leap up to 15 feet off a wall, ground, or structure (Free action, once per turn); your next Melee Weapon Attack during or after deals +{rank3} Force damage. Any other action or movement cancels it. The leap doesn't provoke Opportunity Strikes.",
    "Raging Whirlpool: Spend 1 Focus Point (Free action). Your next Melee Weapon Attack deals +{rank3} Frost damage; all other creatures in your weapon's reach take {rank3} Frost damage; each creature damaged has its Speed reduced by 10 feet until the end of its next turn.",
    "Lightning Strike: Spend 1 Focus Point (Free action). Your Speeds increase by 30 feet (move in one chosen direction until it ends), you move through hostile creatures' spaces without provoking Opportunity Strikes, your next Melee Weapon Attack deals +{rank3} Electric damage, and creatures you passed through (except your target) take {rank2} Electric damage.",
    "Blazing Sun: After a successful Melee Weapon Attack (Free action), replenish all missing Focus Points; each creature within 10 feet of your target (except you) takes 24 Fire damage. Once per Intermission."
  ],
  Alchemist: [
    "Learn 1 Martial Talent. Mobile Apothecary: always count as having an Alchemist Kit equipped.",
    "Energy: Gain and expend Energy Points to use Alchemy.\nAlchemy: Always succeed at crafting Common Alchemy items, and gain a +{rank} modifier when crafting Alchemy items (see page 76).\nSignature Effects: Spend 1 Energy when using an Alchemy item for a Rank 2 Signature Effect.\nEmergency Alchemy: Spend 2 Energy to craft any Common Alchemy item you know.",
    "Always succeed at crafting Uncommon Alchemy items.\nSignature Effects: Spend 2 Energy for a Rank 3 Signature Effect.\nEmergency Alchemy: Spend 3 Energy to craft any Uncommon item you know.",
    "Always succeed at crafting Rare Alchemy items.\nSignature Effects: Spend 3 Energy for a Rank 4 Signature Effect.\nEmergency Alchemy: Spend 4 Energy to craft any Rare item you know.",
    "During an Intermission, roll 1d6: on 1–3 craft an Elixir of Ironhide (page 119); on 4–6 craft Liquid Adamantine (page 121). No Energy cost; once per Light or Full Rest. The crafted item expires after 8 hours of no use."
  ],
  Reaver: [
    "Learn 1 Martial Talent. Soulwell: regain 3 Sorce when a creature dies within 60 ft.",
    "Energy: Gain and expend Energy Points to use Reaver abilities.\nReaver Mark: Spend 1 Energy Point (Free action) to mark a creature for 7 days. You deal +{rank2} Necrotic damage to it, always know its general direction, and it can't hide from you. One Mark at a time.",
    "Reaver Servant: Spend 2 Energy Points (Quick action) to summon a Skeletal Squire (Fighter or Archer), treated as a Summoned Companion; or spend 1 Energy Point to raise one from a corpse within 15 feet. Lasts 8 hours; one at a time. (Stat blocks: page 79.)",
    "Shroud: Spend 3 Energy Points (Free action) to become a dark, incorporeal form for 1 minute: fit through 1-inch gaps, Invisible in darkness, HP and DP resist Slash/Pierce/Blunt and are immune to Necrotic, Fly Speed equal to your base Speed, and immune to Prone, Grappled, and Restrained. Your next Weapon Attack gains a +2 modifier and deals +12 Necrotic damage. Shroud ends after you make a Melee or Ranged Weapon Attack or cast a Spell.",
    "Reaver's Reap: When you damage a creature with your Reaver's Mark, activate (Free action) to double the Mark's extra damage and regain 6 Energy Points — or all missing Energy Points if the creature ends Bloodied. Once per Light or Full Rest."
  ],
  Spellweaver: [
    "Learn 1 Sorcery Talent. Magic Master: +1 modifier on Spell checks.",
    "Focus: Gain and use Focus Points for Spellweaver abilities. You may use several per spell, and may choose to use them after rolling a Spell check.\nSpell Charge: When casting a Rank 1+ Spell with a Spell check, spend 1 Focus Point for a +2 modifier.",
    "Regain Control: When you Overcharge a Spell and roll any 1s, spend 1 Focus Point to ignore them.",
    "Spell Charge: Its bonus dice become d8s.\nEmpowered Magics: When your Spell forces a Skill save, spend 1 Focus Point to give all Skill Saves against it a -2 modifier.",
    "Megacharge: When casting a Spell of Rank 5 or lower, Overcharge it with no Arcane Mishap and double its Power Levels. No other Spellweaver abilities this action; regain all missing Focus Points after. Once per Light or Full Rest."
  ],
  Warlock: [
    "Patron's Gift: Spells from your chosen Study of Sorcery cost 1 less Sorce to cast (min 1).",
    "Unlock Warlock Contracts (page 82); hold up to 2 Contracts between Light or Full Rests.",
    "Hold up to 4 Warlock Contracts between rests; unlock new contracts.",
    "Hold up to 6 Warlock Contracts between rests; unlock new contracts.",
    "Patron's Avatar: Quick action; become your Patron's Avatar for 1 minute. Patron's Gift spells cost half Sorce; those of Rank 1+ gain 2 Power Levels; Rank 0 damaging ones deal +4 damage (+2 if Mental). Once per Light or Full Rest."
  ],
  Oracle: [
    "Learn 1 Sorcery Talent. Sorce Sense: see magic auras; +1 modifier on Initiative.",
    "Stamina: Gain and expend Stamina Points to use Oracle abilities; a Quick action regains all lost Stamina.\nOracle States: When you gain Stamina, enter Sorce State or Future State.\nArcane Sight (Sorce State): See whether a creature or object is Cursed and the Curse's nature; +{rank} modifier to see through magical illusions; see creatures made invisible by magic.\nEnhance Magic (Sorce State): When you or a willing creature within 30 feet makes a Spell check, spend 1 Stamina Point to reroll one die (not on Overcharged checks; once per check). Free action on yourself, Reaction on others.\nSecond-Sight Reflexes (Future State): +1 modifier to Blocks, Parries, Dodges, and Skill saves, and one extra Reaction each round.\nEnhanced Defense (Future State): When you Dodge, Block, or Parry, spend 1 Stamina Point (Free action) to reroll one die (not on Pushed checks; once per check).",
    "Disrupt Arcane (Sorce State): Standard action, 2 Stamina Points, to disrupt a Spell or magical effect. Roll a check using Wits and your specialty rank (counts as a Skill check). Vs a Spell: -1 modifier per Rank it was cast at; success dispels it. Vs an effect: the GM sets a Difficulty (and may add a Danger); success suppresses it up to 1 minute or until you stop. On a failure, you can't retry that same effect or cast until an Intermission.\nVigilance (Future State): When you or a creature you see is attacked, spend 2 Stamina Points to let them Dodge, Parry, or Block as a Free action. Free action on yourself, Reaction on others.",
    "Sorcery Shield (Sorce State): When you make a Skill save vs a Spell or magical effect, spend 3 Stamina Points (Reaction) to replace your save pool with 6d8 (counts as a Skill check). Success makes you immune to it until the end of your next turn. Not vs Forbidden Spells.\nTip the Scales (Future State): When you or a willing creature within 30 feet makes a Skill save, spend 3 Stamina Points to let them reroll up to two dice (once per save; not on Pushed checks). Free action on yourself, Reaction on others.",
    "Time and Space: Quick action; heightened state for 1 minute. Your Stamina refreshes at the start of each turn and you can use both Sorce State and Future State passives and abilities. Once per Light or Full Rest."
  ],
  Witch: [
    "Learn 1 Sorcery Talent. Summon Familiar: telepathy & cast Spells through it within 60 ft.",
    "Energy: Gain and spend Energy Points to fuel Witch abilities.\nEnchanting Charm: Spend 1 Energy Point (Quick action) to place a charm on a creature for 1 hour.\nCat Whisker: Gain Nightvision.\nWolf Fang: Your Melee or Ranged Weapon Attack base damage is +2.\nFalcon Feather: Increase your Speed by 10.\nFish Scales: Breathe in air and water, and gain a Swim Speed equal to your base Speed.",
    "Brewing: Spend 2 Energy during an Intermission to craft a special Witch Elixir (page 87); your Familiar becomes a cauldron that acts as an Alchemy Kit, and you gain a +2 modifier to craft other Alchemy items.\nShare Senses: Quick action to enter or leave for up to 1 hour. You see, hear, and speak through your Familiar and can't cast Spells (but may keep focusing on them); your body is Unconscious.",
    "Jinx: When a creature within 60 feet succeeds with one success or fails a Skill check, spend 3 Energy Points (Reaction) to Jinx it. On one success: it rerolls that die, changing a d8 to a d6. On a failure: it rerolls up to 3 dice, changing d6s to d8s. Not on Pushed checks.\nFamiliar Flight: While your Familiar is within 30 feet, use a Quick action to turn it into a Witch Broom (or back). As a Broom you can mount it; it has a 40 ft. Fly Speed and halves all physical damage it takes.",
    "Voodoo Doll: Quick action; select up to 3 creatures within 120 ft. and create a doll of each, plus 3 pins to place anywhere on them. Pins buff or debuff based on their placement and whether the creature is an ally or foe (page 87). A Minor Action changes a pin's location."
  ],
  Shapeshifter: [
    "Learn 1 Sorcery Talent. Animal Form: create & activate a Small Animal Form for 24h; swap Hybrid/Beast Shape.",
    "You can now shapeshift into Tiny and Medium Animal Forms.\nEnergy: Gain and spend Energy Points to enhance Animal Forms with Beast Traits, up to 2 active per Form. Each active Beast Trait gives 5 Temp HP that replenishes during an Intermission.",
    "Up to 4 Beast Traits active per Animal Form; unlock additional Beast Traits.",
    "Up to 6 Beast Traits active per Animal Form; unlock additional Beast Traits.",
    "Chimera Form: Enter this special Animal Form for 1 minute, selecting up to 8 Beast Traits without spending Energy. Once per Light or Full Rest."
  ],
  Summoner: [
    "Learn 1 Sorcery Talent. Spirit Companion: summon the Scout Stage 1 Form during an Intermission.",
    "Stamina: Gain and expend Stamina Points to use Summoner Commands.\nCommand-Dodge: When your companion is targeted by a Melee or Ranged attack, spend 1 Stamina (Free Action) to oppose it with your Tame.\nSpirit Forms: Unlock the Hunter and Warden Stage 1 forms for your Spirit Companion.",
    "Your Spirit Companion forms evolve into Stage 2 versions.\nCommand-Resist: When your companion makes a Skill Save, spend 2 Stamina (Free Action) to substitute its Skill dice with your Tame dice pool.",
    "Your Spirit Companion forms evolve into Stage 3 versions.\nCommand-Push Limits: When your companion fails a Skill check, spend 3 Stamina (Free Action) to make a Tame check and use your result as the new check. Once per check.",
    "Unity Apex: Quick action; transform your spirit into its Apex Form and enter a Packbound Stance for 1 minute. Your Stamina refreshes now and at the start of each turn. Once per Light or Full Rest."
  ],
  Sonneteer: [
    "Learn 1 Sorcery Talent. Rally: Quick action - a creature gains +1 on its next Skill check.",
    "Focus: Gain and use Focus Points for Sonneteer techniques.\nInspire: When a creature within 15 feet attempts a Skill check, spend 1 Focus Point (Free action) to grant an extra Proficiency die as a special +1 modifier. Not if they've already attempted the check.\nGuiding Words: Within 15 feet of a creature that understands you, you may use Perform for the Assist action regardless of the skill they're attempting. Once per Intermission.",
    "Insult: When a creature within 15 feet attempts a Skill check, spend 1 Focus (Reaction) to inflict a -2 modifier on it.\nMotivating Melody: During a shared Intermission or Light Rest, choose any number of the creatures present; each Recovery die a chosen creature spends restores an extra 2 Status Points.",
    "Distract: When a creature within 30 feet attempts a Reaction, spend 1 Focus Point (Free action) to Distract them: make a Perform check opposed by their Insight; on a success their Reaction fails and is lost.\nEchoing Voice: You can Galvanize up to 30 feet, and Inspire and Insult gain 30 feet of range.",
    "Maestro's Gambit: Quick action; enter this stance for 1 hour. Inspire, Insult, and Distract reach 60 feet; Inspire gives up to 2 Proficiency dice as a special +2 modifier, Insult inflicts -4, and Distract can't be Opposed. Once per Light or Full Rest."
  ],
  Cleric: [
    "Learn 1 Sorcery Talent. Blessed Recovery: Recovery dice spent during shared Rests can't roll below 3.",
    "Energy: Gain and use Energy Points to reinvigorate and bless allies.\nBlessed Restoration: Spend 1 Energy Point (Quick action) to bless a creature within 30 feet, replenishing HP or MP equal to {rank3}.",
    "Purification: Spend 2 Energy (Quick action) to bless a creature within 30 feet and cleanse one of: Enraged, Blinded, Dazed, or Shocked.",
    "Aegis Intervention: When a creature within 120 feet would gain a Wound or Trauma, spend 3 Energy (Free Action) to remove up to two of the dice determining it; if that leaves 0 dice, the result becomes 1. If an NPC would instead gain Doom Stacks, reduce them by 1.",
    "Divine Intervention: When you or a creature you see within 120 ft. makes a Skill save, spend a Reaction to grant it 3 successes (usable after seeing the result). Not on the same creature again until a Light or Full Rest."
  ],
};

// -- Talent Lists -------------------------------------------------------
const MARTIAL_TALENTS = ['Boar Style', 'Brawler', 'Calvary Fighter', 'Crane Style', 'Defender', 'Dragon Style', 'Duelist', 'Ignore Pain', 'Mantis Style', 'Master of Defense', 'Opportunist', 'Porcupine Style', 'Primal Style', 'Rabbit Style', 'Rubber Style', 'Sniper Style', 'Tiger Style', 'Tortoise Style', 'Viper Style', 'Wolf Style'];
// Full sorcery talent list (used for leveling — kept for future use)
const SORCERY_TALENTS_ALL = ['Elemental Attunement', 'Innate Magic', 'Megamind', 'Mental Shield', 'Runic Magic', 'Spell Slinger', 'Study of Aeromancy', 'Study of Blood', 'Study of Contagion', 'Study of Cryomancy', 'Study of Death', 'Study of Displacement', 'Study of Divinity', 'Study of Geomancy', 'Study of Illusion', 'Study of Pyromancy', 'Study of Recovery', 'Study of Shadows', 'Twist Magicka', 'War Caster'];
// Level 1 character creation — excludes talents that require other talents as prerequisites
const SORCERY_TALENTS = ['Innate Magic', 'Mental Shield', 'Runic Magic', 'Study of Aeromancy', 'Study of Blood', 'Study of Contagion', 'Study of Cryomancy', 'Study of Death', 'Study of Displacement', 'Study of Divinity', 'Study of Geomancy', 'Study of Illusion', 'Study of Pyromancy', 'Study of Recovery', 'Study of Shadows'];
const GENERAL_TALENTS = ["Academic","Angelic Blood","Animal Ally","Animal Companion","Backseat Braining","Caster Initiate","Demonic Blood","Field Medic","Full Dodge","Heckler","Inspiring","Intimidating","Keen Eyes","Linguist","Look Over There","Luck of the Gods","Master Spy","Min Max","Mobile","Naturally Gifted","Skilled","Sneaky","Steady Hands","Steel Saves","Strategic Purchase","Strong Arm","Sturdy","Take Your Turn","Toss a Friend","Vigilant","Warfare Initiate"];

// -- Starting Gear by Specialty -----------------------------------------
const STARTING_GEAR = {
  Guardian:    {silver:20, items:['Short sword, hand axe, or hammer','Small shield','Quilted Vest or Layered Plate Armor','Backpack']},
  Berserker:   {silver:20, items:['Long sword, mace, or battle axe','Quilted Vest or Layered Plate armor','Backpack']},
  Engineer:    {silver:20, items:['Shortsword or flintlock pistol','Small shield or bullet pouch','Quilted Vest or Layered Plate armor','Engineer tool kit','Backpack']},
  Pugilist:    {silver:20, items:['Quilted Vest or Layered Plate armor','Limb Wraps','Backpack']},
  Sharpshooter:{silver:20, items:['Short bow, flintlock pistol, or crossbow','Arrow quiver, bolt pouch, or bullet pouch','Quilted Vest or Light Leather armor','Backpack']},
  Elemancer:   {silver:20, items:['Short sword, mace, battle axe, or dagger','Quilted Vest or Light Leather armor','Backpack']},
  Alchemist:   {silver:20, items:['Short sword or short bow','Dagger or arrow quiver','Quilted Vest or Light Leather armor','Alchemy kit','Backpack']},
  Reaver:      {silver:20, items:['Short sword or short bow','Dagger or arrow quiver','Quilted Vest or Light Leather armor','Backpack']},
  Spellweaver: {silver:20, items:['Arcane wand or arcane staff','Quilted Vest armor','Backpack']},
  Warlock:     {silver:20, items:['Arcane wand or arcane staff','Quilted Vest armor','Backpack']},
  Oracle:      {silver:20, items:['Arcane wand or arcane staff','Quilted Vest or Light Leather armor','Backpack']},
  Witch:       {silver:20, items:['Arcane wand or arcane staff','Quilted Vest armor','Backpack']},
  Shapeshifter:{silver:20, items:['Arcane wand or a longsword','Quilted Vest or Layered Plate armor','Backpack']},
  Summoner:    {silver:20, items:['Arcane wand, shortbow (with arrow quiver), or shortsword','Quilted Vest or Light Leather armor','Backpack']},
  Sonneteer:   {silver:20, items:['Arcane wand or arcane instrument','Dagger','Dagger','Quilted Vest armor','Backpack']},
  Cleric:      {silver:20, items:['Arcane staff or mace','Quilted Vest or Layered Plate armor','Backpack']},
};

// -- Character State ----------------------------------------------------
function createDefaultCharacter() {
  return {
    array: null,
    attrs: {STR:0, AGI:0, WIT:0, EMP:0},
    skills: {},
    lineage: null,
    lineageTrait: null,
    mixedLineage: false,
    mixedLineages: [],      // up to 2 traditional lineages
    mixedSubTraits: {},     // subTrait per lineage if needed
    mixedAssignment: {features: null, major: null, minor: null},
    undeadRepurposedLineage: null,
    sizeChoice: null,             // 'Small' or 'Medium' for Human/Ozonian
    dryvornBloodline: null,       // chosen Dragon Bloodline for Dryvorn
    mixedForcedSmall: false,
    cls: null,
    clsSkillChoices: {},
    specialty: null,
    lifepath: {upbringing:null, culture:null, personality:null, value:null,
               upset:null, decisions:null, viewOfOthers:null},
    lifepathCustom: {},
    extraLanguage: null,       // selected Extra Languages background
    extraLanguagePicks: [],    // chosen language names (speak)
    extraLanguageReads: [],    // chosen language names (read)
    equip: Array(6).fill(''),
    currency: {silver:0, gold:0, pluther:0},
    notable: Array(10).fill(''),
    talents: Array(9).fill(''),
    talentRanks: Array(9).fill(1),
    specialtyTalent: '',
    lineageBenefits: '',
    evolvedPurpose: null,
    name: '', level: 1, height: '', weight: '', age: '', notes: '',
    levelUps: [],
    casterAttr: null,
    reliableAttr: null,
    weapons: Array(5).fill(null).map(()=>({name:'',range:'',mod:'',damage:'',pool:'',features:''})),
    gearSelections: {},
    _viewingTalent: null,
  };
}

function mergeCharacterState(saved) {
  const base = createDefaultCharacter();
  const incoming = saved || {};
  const merged = {
    ...base,
    ...incoming,
    attrs: {...base.attrs, ...(incoming.attrs || {})},
    skills: {...base.skills, ...(incoming.skills || {})},
    lifepath: {...base.lifepath, ...(incoming.lifepath || {})},
    lifepathCustom: {...base.lifepathCustom, ...(incoming.lifepathCustom || {})},
    currency: {...base.currency, ...(incoming.currency || {})},
    mixedAssignment: {...base.mixedAssignment, ...(incoming.mixedAssignment || {})},
    mixedSubTraits: {...base.mixedSubTraits, ...(incoming.mixedSubTraits || {})},
    gearSelections: {...base.gearSelections, ...(incoming.gearSelections || {})},
    equip: Array.isArray(incoming.equip) ? incoming.equip : base.equip,
    notable: Array.isArray(incoming.notable) ? incoming.notable : base.notable,
    talents: Array.isArray(incoming.talents) ? incoming.talents : base.talents,
    talentRanks: Array.isArray(incoming.talentRanks) ? incoming.talentRanks : base.talentRanks,
    weapons: Array.isArray(incoming.weapons) ? incoming.weapons : base.weapons,
    extraLanguagePicks: Array.isArray(incoming.extraLanguagePicks) ? incoming.extraLanguagePicks : base.extraLanguagePicks,
    extraLanguageReads: Array.isArray(incoming.extraLanguageReads) ? incoming.extraLanguageReads : base.extraLanguageReads,
    mixedLineages: Array.isArray(incoming.mixedLineages) ? incoming.mixedLineages : base.mixedLineages,
    levelUps: Array.isArray(incoming.levelUps) ? incoming.levelUps : base.levelUps,
  };
  const prev = ch;
  ch = merged;
  normalizeBaseChoices();
  const normalized = ch;
  ch = prev;
  return normalized;
}

let ch = createDefaultCharacter();

// -- Base vs. bonus ranks -----------------------------------------------
// ch.attrs and ch.skills store only the player's Step 1 / Step 2 choices.
// Class bonuses are calculated dynamically so returning to earlier steps
// does not make those bonuses consume point-buy points or starting-skill slots.
function getClassData() {
  return ch.cls ? CLASSES.find(c => c.name === ch.cls) : null;
}

function getClassAttrBonus(key) {
  const cls = getClassData();
  return cls?.attrBonus?.[key] || 0;
}

function getEffectiveAttr(key) {
  return (ch.attrs[key] || 0) + getClassAttrBonus(key) + luAttrBonus(key);
}

function getEffectiveAttrSum() {
  return ATTRIBUTES.reduce((sum, a) => sum + getEffectiveAttr(a.key), 0);
}

function getClassSkillBonus(key) {
  const cls = getClassData();
  if (!cls) return 0;
  let bonus = 0;
  if (cls.skillBonus?.includes(key)) bonus += 1;
  if (ch.clsSkillChoices?.[key]) bonus += 1;
  return bonus;
}

function getSkillRank(key) {
  return (ch.skills[key] || 0) + getClassSkillBonus(key) + luSkillPoints(key);
}

function getStartingSkillCount() {
  return Object.keys(ch.skills).filter(k => (ch.skills[k] || 0) > 0).length;
}

function normalizeBaseChoices() {
  // Convert older saves from the previous implementation, where class bonuses
  // were directly added into ch.attrs/ch.skills, back into base choices only.
  if (ch.cls) {
    const cls = CLASSES.find(c => c.name === ch.cls);
    if (cls) {
      const attrSum = Object.values(ch.attrs).reduce((a, b) => a + (b || 0), 0);
      if (attrSum > POINT_BUY_TOTAL) {
        Object.keys(cls.attrBonus || {}).forEach(k => {
          ch.attrs[k] = Math.max(0, (ch.attrs[k] || 0) - (cls.attrBonus[k] || 0));
        });
      }
    }
  }
  Object.keys(ch.attrs).forEach(k => {
    ch.attrs[k] = Math.max(0, Math.min(POINT_BUY_MAX, Number(ch.attrs[k]) || 0));
  });
  Object.keys(ch.skills).forEach(k => {
    ch.skills[k] = (Number(ch.skills[k]) || 0) > 0 ? 1 : 0;
  });
}



// --- Moved from builder.js ---
function getLevel() { return Math.min(20, 1 + (ch.levelUps || []).length); }
function luSum(k) { return (ch.levelUps || []).reduce((a, l) => a + (Number(l[k]) || 0), 0); }
function luSkillPoints(key) { return (ch.levelUps || []).reduce((a, l) => a + ((l.skills || {})[key] || 0), 0); }
function skillCapAtLevel(lv) { return lv < 5 ? 2 : lv < 9 ? 3 : lv < 13 ? 4 : lv < 17 ? 5 : 6; }
function talentCapAtLevel(lv) { return lv < 4 ? 2 : lv < 10 ? 3 : lv < 16 ? 4 : 5; }
function specialtyRankAtLevel(lv) { return 1 + SPECIALTY_RANK_LEVELS.filter(m => lv >= m).length; }

// Special level features
const ATTR_POINT_LEVELS = [3, 7, 12, 15];   // +1 Attribute Point
const EXTRA_SKILL_LEVELS = [8, 14];         // +1 additional Skill Point

// Attribute increases from level-ups (+1 Attribute Points, Naturally Gifted, Min Max)
function luAttrBonus(key) {
  return (ch.levelUps || []).reduce((a, l) => {
    let v = 0;
    if (l.attrChoice === key) v += 1;
    if (l.talent && l.talent.kind === 'new') {
      if (l.talent.name === 'Naturally Gifted' && l.bonusAttr === key) v += 1;
      if (l.talent.name === 'Min Max') { if (l.minMaxUp === key) v += 2; if (l.minMaxDown === key) v -= 1; }
    }
    return a + v;
  }, 0);
}
function totalLuAttrPoints() { return ATTRIBUTES.reduce((a, at) => a + luAttrBonus(at.key), 0); }
// Cumulative HP/MP bonuses from General Talents (verbatim: +4, +8 more, +12 more)
function generalHPBonus() { const r = getCharacterTalents().get('Sturdy') || 0; return [0, 4, 12, 24][Math.min(r, 3)]; }
function generalMPBonus() { const r = getCharacterTalents().get('Academic') || 0; return [0, 4, 12, 24][Math.min(r, 3)]; }

// Map of talent name -> current rank (level 1 picks + all level-up gains/rank-ups)
function getCharacterTalents() {
  const map = new Map();
  (ch.talents || []).filter(t => t).forEach(t => map.set(t, 1));
  (ch.levelUps || []).forEach(l => {
    if (!l.talent) return;
    if (l.talent.kind === 'new') {
      map.set(l.talent.name, 1);
      if (l.bonusTalent) map.set(l.bonusTalent, 1);
    } else if (l.talent.kind === 'rankup' && map.has(l.talent.name)) {
      map.set(l.talent.name, map.get(l.talent.name) + 1);
    }
  });
  return map;
}
function hasCharTalent(name) { return getCharacterTalents().has(name); }

function getSpellcastingAttrKey() {
  if (ch.cls === 'Magi') return 'WIT';
  if (ch.cls === 'Druid') return 'EMP';
  if (hasCharTalent('Caster Initiate')) return ch.casterAttr || null;
  return null;
}
function calcHP()  { let hp = ((getEffectiveAttr('STR') + getEffectiveAttr('AGI')) * 2) + 4; if (ch.specialty === 'Berserker') hp += 8; hp += luSum('hp') + generalHPBonus(); return hp; }
function calcMP()  { let mp = ((getEffectiveAttr('WIT') + getEffectiveAttr('EMP')) * 2) + 4; mp += luSum('mp') + generalMPBonus(); return mp; }
function calcDP()  { return 0; } // Set by armor
function calcSP()  { return calcMP(); } // Sorce Points = max MP
