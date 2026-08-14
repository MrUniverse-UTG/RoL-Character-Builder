let currentStep = 1;
const TOTAL_STEPS = 12;

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════
function goToStep(n) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
  currentStep = n;
  updateProgress();
  updateNavBtns();
  window.scrollTo({top:0, behavior:'smooth'});
  if (n===1)  renderArrayPicker();
  if (n===2)  renderSkillList();
  if (n===3)  {
    renderLineageGrid();
    const mlCb = document.getElementById('mixed-lineage-cb');
    const mlPanel = document.getElementById('mixed-lineage-panel');
    if (ch.mixedLineage) {
      if (mlCb) mlCb.checked = true;
      if (mlPanel) mlPanel.style.display = 'block';
      renderMixedPanel();
      // Also render extra pickers (Dryvorn bloodline, size choice) in detail area
      if (ch.mixedLineages.length > 0) renderLineageDetail();
    } else {
      if (mlCb) mlCb.checked = false;
      if (mlPanel) mlPanel.style.display = 'none';
      if (ch.lineage) renderLineageDetail();
    }
  }
  if (n===4)  { renderClassGrid(); renderClassSkillChoices(); }
  if (n===5)  renderSpecialtyGrid();
  if (n===6)  renderGearStep();
  if (n===7)  renderLifepath();
  if (n===8)  renderStatusPoints();
  if (n===9)  renderTalentStep();
  if (n===10) renderDetailsStep();
  if (n===11) renderSummary();
  if (n===12) renderLevelUp();
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
}

function prevStep() {
  if (currentStep <= 1) return;
  if (currentStep - 1 <= 10 && (ch.levelUps || []).length) {
    alert('Creation steps are locked after leveling up. Use "Undo Level" in the Level Up step to revert level-ups first.');
    return;
  }
  goToStep(currentStep - 1);
}

function updateProgress() {
  const locked = (ch.levelUps || []).length > 0;
  document.querySelectorAll('.prog-step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active','done','clickable');
    if (s === currentStep) el.classList.add('active');
    else if (s < currentStep) {
      el.classList.add('done');
      // Creation steps (1-10) lock once the character has leveled up
      if (!locked || s >= 11) el.classList.add('clickable');
    }
    // Always reset the handler — a stale onclick from before leveling would
    // let users navigate into locked creation steps.
    if (el.classList.contains('clickable')) {
      el.onclick = () => goToStep(s);
      el.style.opacity = '';
      el.title = '';
    } else if (locked && s <= 10) {
      el.onclick = () => alert('Creation steps are locked after leveling up. Use "Undo Level" in the Level Up step to revert all level-ups first.');
      el.style.opacity = '0.45';
      el.title = 'Locked while level-ups exist';
    } else {
      el.onclick = null;
      el.style.opacity = '';
      el.title = '';
    }
  });
}

function updateNavBtns() {
  const back = document.getElementById('btn-back');
  const next = document.getElementById('btn-next');
  const save = document.getElementById('btn-save');
  const ind  = document.getElementById('save-indicator');
  back.style.display = currentStep > 1 ? 'block' : 'none';
  save.style.display = (currentStep > 1 && currentStep < 11) ? 'inline-block' : 'none';
  if (ind) ind.style.display = currentStep > 1 && currentStep < 11 && ind.textContent ? 'inline' : 'none';
  next.textContent = currentStep === 11 ? 'Level Up ⇧' : 'Next Step →';
  next.style.display = (currentStep === TOTAL_STEPS || currentStep === 11) ? 'none' : 'inline-block';
}

function validateStep(step) {
  switch(step) {
    case 1: {
      const spent = Object.values(ch.attrs).reduce((a,b) => a + (b||0), 0);
      if (spent < POINT_BUY_TOTAL) {
        alert(`Please spend all ${POINT_BUY_TOTAL} points before continuing. (${spent} spent, ${POINT_BUY_TOTAL - spent} remaining)`);
        return false;
      }
      return true;
    }
    case 2:
      const skillCount = getStartingSkillCount();
      if (skillCount < 5) { alert('Please select exactly 5 starting skills.'); return false; }
      return true;
    case 3: {
      if (ch.mixedLineage) {
        if (ch.mixedLineages.length < 2) { alert('Please select two Traditional Lineages for Mixed Lineage.'); return false; }
        if (ch.mixedLineages.includes('Dryvorn') && !ch.dryvornBloodline) {
          alert('Please choose a Dragon Bloodline for Dryvorn.');
          return false;
        }
        if (!ch.mixedAssignment.features) { alert('Please choose which lineage provides your Features.'); return false; }
        applyMixedSizeRules();
        if (hasVariableSizeMixedLineage() && !ch.sizeChoice) {
          alert('Please choose a size (Small or Medium) for your mixed lineage.');
          return false;
        }
        if (!ch.mixedAssignment.major)    { alert('Please choose which lineage provides your Major Trait.'); return false; }
        if (!ch.mixedAssignment.minor)    { alert('Please choose which lineage provides your Minor Trait.'); return false; }
        // Check sub-traits resolved
        const [l1,l2] = ch.mixedLineages;
        const lg1x = LINEAGES.find(l=>l.name===l1), lg2x = LINEAGES.find(l=>l.name===l2);
        if (lg1x?.traitDetails && !ch.mixedSubTraits[l1]) { alert('Please choose a sub-group for '+l1); return false; }
        if (lg2x?.traitDetails && !ch.mixedSubTraits[l2]) { alert('Please choose a sub-group for '+l2); return false; }
        return true;
      }
      if (!ch.lineage) { alert('Please choose a Lineage.'); return false; }
      if (isPridae() && !ch.evolvedPurpose) { alert('Please choose your Evolved Purpose for your Pridae lineage before continuing.'); return false; }
      if (ch.lineage === 'Dryvorn' && !ch.dryvornBloodline) {
        alert('Please choose a Dragon Bloodline for your Dryvorn character.');
        return false;
      }
      if ((ch.lineage === 'Humans' || ch.lineage === 'Ozonian') && !ch.sizeChoice) {
        alert('Please choose a size (Small or Medium) for your ' + ch.lineage + ' character.');
        return false;
      }
      if (getEffectiveLineageName() === 'Ozonian' && !ch.ozonianLanguage) {
        alert('Please choose the traditional language your Ozonian speaks and reads.');
        return false;
      }
      if (ch.lineage === 'Undead' && ch.undeadRepurposedLineage) {
        const repLg3 = LINEAGES.find(l => l.name === ch.undeadRepurposedLineage);
        if (repLg3?.traitDetails && !(ch.mixedSubTraits && ch.mixedSubTraits['undead_' + ch.undeadRepurposedLineage])) {
          alert('Please choose a sub-group for your ' + ch.undeadRepurposedLineage + ' Repurposed trait.');
          return false;
        }
      }
      if (ch.lineage === 'Undead' && ch.undeadRepurposedLineage === 'Dryvorn' && !ch.dryvornBloodline) {
        alert('Please choose a Dragon Bloodline for your Dryvorn Repurposed trait.');
        return false;
      }
      if (ch.lineage === 'Undead' && !ch.undeadRepurposedLineage) {
        alert('Please choose your original Traditional Lineage for the Repurposed trait.');
        return false;
      }
      const lg3 = LINEAGES.find(l=>l.name===ch.lineage);
      if (lg3 && lg3.traits.length > 1 && lg3.traitDetails && !ch.lineageTrait) {
        alert('Please choose a ' + ch.lineage + ' sub-group (' + lg3.traits.join(' or ') + ') before continuing.');
        return false;
      }
      return true;
    }
    case 4:
      if (!ch.cls) { alert('Please choose a Class.'); return false; }
      const cls = CLASSES.find(c=>c.name===ch.cls);
      for (const choice of cls.skillChoice) {
        const chosen = choice.from.filter(s => ch.clsSkillChoices[s]);
        if (chosen.length < choice.pick) { alert(`Please make all Class skill choices.`); return false; }
      }
      return true;
    case 5:
      if (!ch.specialty) { alert('Please choose a Specialty.'); return false; }
      return true;
    case 7: {
      // Prompt if no extra language background chosen (soft warning, not a hard block)
      if (EXTRA_LANGUAGE_OPTIONS.length > 0 && !ch.extraLanguage) {
        if (!confirm("You haven't selected an Extra Languages background. Continue without choosing one?")) {
          return false;
        }
      }
      // Hard block: all pick slots must be filled if a background was chosen
      if (ch.extraLanguage) {
        const langOpt = EXTRA_LANGUAGE_OPTIONS.find(o => o.name === ch.extraLanguage);
        if (langOpt?.picks) {
          const totalPicks = (langOpt.picks.speak || 0) + (langOpt.picks.speak2 || 0);
          for (let i = 0; i < totalPicks; i++) {
            if (!ch.extraLanguagePicks[i]) {
              alert('Please choose all your extra language picks before continuing.');
              return false;
            }
          }
        }
      }
      return true;
    }
    case 9: {
      // Must have selected at least one talent
      const hasTalent = (ch.talents||[]).some(t => t);
      if (!hasTalent) {
        alert('Please select at least one Talent before continuing.');
        return false;
      }
      return true;
    }
    case 10: {
      // Sync name from DOM before validating
      const nameEl = document.getElementById('char-name');
      if (nameEl) ch.name = nameEl.value.trim();
      if (!ch.name || !ch.name.trim()) { alert('Please enter a character name.'); return false; }
      return true;
    }
    default: return true;
  }
}

// ═══════════════════════════════════════════════════════════════
// STEP 1 - ARRAYS + ATTRIBUTE ASSIGNMENT
// ═══════════════════════════════════════════════════════════════

// Skill descriptions shown as footnotes in skill pickers
const SKILL_HINTS = {
  Brawl:      'Melee attacks, parrying, and blocking',
  Might:      'Grappling, shoving, athletics',
  Endure:     'Fighting infections, resisting physical stress, maintaining spell focus',
  Intimidate: 'Scaring creatures and forcing them to attack you',
  Move:       'Acrobatics and dodging',
  Hide:       'Being unseen and unheard',
  Finesse:    'Pickpocket, disarming, handling volatile objects',
  Shoot:      'Ranged attacks and throwing objects',
  Analyze:    'Investigating, understanding, and manipulating technology and magic',
  Scout:      'Searching and detecting things in the area',
  Insight:    'Recalling knowledge, reading expressions, and resisting magical influence',
  Survival:   'Detecting poisons and tracking creatures',
  Manipulate: 'Persuading and lying',
  Perform:    'Acting, disguising, distracting',
  Medical:    'Healing, diagnosing, understanding physiology',
  Tame:       'Communicating, commanding, and calming beasts',
};

function renderArrayPicker() {
  renderPointBuy();
}

function renderPointBuy() {
  const container = document.getElementById('point-buy-ui');
  if (!container) return;
  const spent = Object.values(ch.attrs).reduce((a,b) => a + (b||0), 0);
  const remaining = POINT_BUY_TOTAL - spent;

  let html = '<div class="' + (remaining === 0 ? 'info-box' : 'warn-box') + '" style="margin-bottom:16px">'
    + '<strong>' + remaining + ' point' + (remaining !== 1 ? 's' : '') + ' remaining</strong> of ' + POINT_BUY_TOTAL
    + (remaining === 0 ? ' \u2014 all points allocated \u2713' : '') + '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">';
  ATTRIBUTES.forEach(function(attr) {
    const baseVal = ch.attrs[attr.key] || 0;
    const bonusVal = getClassAttrBonus(attr.key);
    const val = baseVal + bonusVal;
    const canInc = remaining > 0 && baseVal < POINT_BUY_MAX;
    const canDec = baseVal > 0;
    const bs = 'width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:var(--surface);font-size:1.1rem;color:var(--text);cursor:pointer;font-weight:700;display:flex;align-items:center;justify-content:center;';
    html += '<div class="attr-slot">'
      + '<div class="attr-name">' + attr.name + '</div>'
      + '<div class="attr-desc">' + attr.desc + '</div>'
      + '<div style="display:flex;align-items:center;gap:12px;margin-top:8px">'
      + '<button onclick="adjustAttr(\'' + attr.key + '\',-1)" style="' + bs + (canDec ? '' : 'opacity:.3;cursor:not-allowed') + '"' + (canDec ? '' : ' disabled') + '>\u2212</button>'
      + '<span style="font-family:var(--font-ui);font-size:1.6rem;font-weight:700;color:var(--accent-dk);min-width:20px;text-align:center">' + val + '</span>'
      + (bonusVal ? '<span style="font-family:var(--font-ui);font-size:.75rem;color:var(--safe)">base ' + baseVal + ' + class ' + bonusVal + '</span>' : '')
      + '<button onclick="adjustAttr(\'' + attr.key + '\',1)" style="' + bs + (canInc ? '' : 'opacity:.3;cursor:not-allowed') + '"' + (canInc ? '' : ' disabled') + '>+</button>'
      + '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function adjustAttr(key, delta) {
  const val = ch.attrs[key] || 0;
  const spent = Object.values(ch.attrs).reduce((a,b) => a + (b||0), 0);
  if (delta > 0 && (val >= POINT_BUY_MAX || spent >= POINT_BUY_TOTAL)) return;
  if (delta < 0 && val <= 0) return;
  ch.attrs[key] = val + delta;
  renderPointBuy();
  updateSkillPips();
}

// selectArray no longer used (point buy system)



// ═══════════════════════════════════════════════════════════════
// STEP 2 - SKILLS
// ═══════════════════════════════════════════════════════════════
function renderSkillList() {
  const container = document.getElementById('skill-list');
  let html = '';
  for (const [attrKey, skills] of Object.entries(SKILLS)) {
    const attr = ATTRIBUTES.find(a=>a.key===attrKey);
    html += `<div class="skill-section">
      <h3>${attr.name} Skills</h3>
      <div class="skill-grid">
        ${skills.map(skill => {
          const rank = getSkillRank(skill.key);
          const isSelected = rank >= 1;
          const isClassBonus = getClassSkillBonus(skill.key) > 0;
          return `
            <div class="skill-chip-wrap" style="display:flex;flex-direction:column;gap:2px">
              <div class="skill-chip ${isSelected?'selected':''} ${isClassBonus?'class-bonus':''}"
                   onclick="toggleSkill('${skill.key}')">
                <div class="rank-pip">${rank}</div>
                ${skill.name}
              </div>
              <div style="font-size:.82rem;color:var(--muted);padding-left:4px;line-height:1.4">${SKILL_HINTS[skill.key]||''}</div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
  }
  container.innerHTML = html;
  updateSkillCounter();
}

function toggleSkill(key) {
  const currentRank = ch.skills[key] || 0;
  const selectedCount = getStartingSkillCount();
  if (currentRank >= 1) {
    ch.skills[key] = 0;
  } else {
    if (selectedCount >= 5) { alert('You can only select 5 starting skills.'); return; }
    ch.skills[key] = 1;
  }
  renderSkillList();
}

function isClassBonusSkill(key) {
  if (!ch.cls) return false;
  const cls = CLASSES.find(c=>c.name===ch.cls);
  if (!cls) return false;
  return cls.skillBonus.includes(key) || Object.keys(ch.clsSkillChoices).filter(k=>ch.clsSkillChoices[k]).includes(key);
}

function updateSkillCounter() {
  const selectedCount = getStartingSkillCount();
  const el = document.getElementById('skill-counter');
  el.className = 'selection-counter' + (selectedCount===5?' done':selectedCount>5?' over':'');
  el.innerHTML = `Selected: <strong>${selectedCount} / 5</strong>`;
}

function updateSkillPips() {
  if (currentStep === 2) renderSkillList();
}

// ═══════════════════════════════════════════════════════════════
// STEP 3 - LINEAGE
// ═══════════════════════════════════════════════════════════════

// ── Mixed Lineage ──────────────────────────────────────────────────────
function toggleMixedLineage(checked) {
  ch.mixedLineage = checked;
  ch.mixedLineages = [];
  ch.mixedAssignment = {features: null, major: null, minor: null};
  ch.mixedForcedSmall = false;
  ch.lineage = null;
  ch.lineageTrait = null;
  document.getElementById('lineage-detail').style.display = 'none';
  document.getElementById('mixed-lineage-panel').style.display = checked ? 'block' : 'none';
  renderLineageGrid();
  renderMixedPanel();
}

function renderLineageGrid() {
  const container = document.getElementById('lineage-grid');
  const onlyTraditional = ch.mixedLineage;
  const shown = onlyTraditional ? LINEAGES.filter(l => l.type === 'Traditional') : LINEAGES;

  container.innerHTML = shown.map(lg => {
    let isSelected, isDisabled = false, selClass = '';
    if (ch.mixedLineage) {
      isSelected = ch.mixedLineages.includes(lg.name);
      // Disable if 2 already selected and this isn't one of them
      if (ch.mixedLineages.length >= 2 && !isSelected) isDisabled = true;
      selClass = isSelected ? 'selected' : '';
    } else {
      isSelected = ch.lineage === lg.name;
      selClass = isSelected ? 'selected' : '';
    }
    return `
      <div class="option-card ${selClass}" style="${isDisabled ? 'opacity:.4;cursor:not-allowed' : ''}"
           onclick="${isDisabled ? '' : `selectLineageCard('${lg.name}')`}">
        <div class="card-tag">${lg.type}</div>
        <div class="card-title">${lg.name}</div>
        <div class="card-body">${lg.desc}</div>
        <div class="card-stats">
          <span class="stat-badge size">Size: ${lg.size}</span>
          <span class="stat-badge">Speed: ${lg.speed} ft</span>
          <span class="stat-badge">Speaks: ${lg.langs.speak.join(', ')}</span>
        </div>
      </div>`;
  }).join('');
}

function selectLineageCard(name) {
  if (ch.mixedLineage) {
    // Toggle selection in mixedLineages array
    const idx = ch.mixedLineages.indexOf(name);
    if (idx !== -1) {
      ch.mixedLineages.splice(idx, 1);
      // Reset assignment if deselected
      if (ch.mixedAssignment.features === name) ch.mixedAssignment.features = null;
      if (ch.mixedAssignment.major === name)    ch.mixedAssignment.major = null;
      if (ch.mixedAssignment.minor === name)    ch.mixedAssignment.minor = null;
    } else if (ch.mixedLineages.length < 2) {
      ch.mixedLineages.push(name);
    }
    // Set ch.lineage to first selected for compatibility
    ch.lineage = ch.mixedLineages[0] || null;
    renderLineageGrid();
    renderMixedPanel();
    updateMixedLineageBenefits();
  } else {
    selectLineage(name);
  }
}

function renderMixedPanel() {
  const panel = document.getElementById('mixed-lineage-panel');
  if (!panel || !ch.mixedLineage) return;

  if (ch.mixedLineages.length < 2) {
    panel.innerHTML = `<div class="info-box">Select ${2 - ch.mixedLineages.length} more Traditional Lineage${ch.mixedLineages.length === 0 ? 's' : ''} from the list below.</div>`;
    return;
  }

  const [lg1name, lg2name] = ch.mixedLineages;
  const lg1 = LINEAGES.find(l => l.name === lg1name);
  const lg2 = LINEAGES.find(l => l.name === lg2name);

  const getNeedsSubTrait = (lg) => lg.traits.length > 1 && lg.traitDetails;

  // Sub-trait selectors for lineages that need them
  // Sub-group pickers (Abysian/Sylvanik) shown in lineage-detail below — not here

  const getT = (lgName) => {
    const sub = ch.mixedSubTraits[lgName];
    return getLineageTraits(lgName, sub);
  };
  const t1 = getT(lg1name), t2 = getT(lg2name);

  const assignRow = (label, field, options) => {
    return `<div style="margin-bottom:10px">
      <label style="font-family:var(--font-ui);font-size:.82rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:6px">${label}</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${options.map(opt => `
          <button onclick="setMixedAssignment('${field}','${opt.lineage}')"
            style="padding:7px 14px;font-family:var(--font-ui);font-size:.82rem;font-weight:600;cursor:pointer;border-radius:6px;text-align:left;
                   border:2px solid ${ch.mixedAssignment[field]===opt.lineage?'var(--accent)':'var(--rule)'};
                   background:${ch.mixedAssignment[field]===opt.lineage?'rgba(79,195,247,0.1)':'var(--surface)'};
                   color:${ch.mixedAssignment[field]===opt.lineage?'var(--accent-dk)':'var(--ink)'}">
            <strong>${opt.lineage}</strong><br>
            <span style="font-size:.75rem;font-weight:400">${opt.traitName}</span>
          </button>`).join('')}
      </div>
    </div>`;
  };

  // Only show assignment options if sub-traits are resolved (or not needed)
  const lg1Ready = !getNeedsSubTrait(lg1) || ch.mixedSubTraits[lg1name];
  const lg2Ready = !getNeedsSubTrait(lg2) || ch.mixedSubTraits[lg2name];
  const assignReady = lg1Ready && lg2Ready;

  panel.innerHTML = `
    <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px">
      <div style="font-family:var(--font-ui);font-weight:700;font-size:.95rem;color:var(--accent-dk);margin-bottom:6px">
        Mixed Lineage: ${lg1name} / ${lg2name}
      </div>
      <p style="font-family:var(--font-ui);font-size:.85rem;color:var(--muted)">
        Select both lineages below. Once sub-group and bloodline choices are resolved, assign Features, Major Trait, and Minor Trait in the panel that appears beneath.
      </p>
      <div id="mixed-trait-preview" style="margin-top:12px"></div>
    </div>`;

  // Show extra pickers (Dryvorn bloodline, size) in lineage-detail below
  if (ch.mixedLineages.length > 0) {
    const detailEl = document.getElementById('lineage-detail');
    if (detailEl) {
      detailEl.style.display = 'block';
      renderLineageDetail();
    }
  }

  // Render trait preview if assignment complete
  if (assignReady && ch.mixedAssignment.major && ch.mixedAssignment.minor) {
    const majorSub = ch.mixedSubTraits[ch.mixedAssignment.major];
    const minorSub = ch.mixedSubTraits[ch.mixedAssignment.minor];
    const majorTraits = getLineageTraits(ch.mixedAssignment.major, majorSub);
    const minorTraits = getLineageTraits(ch.mixedAssignment.minor, minorSub);
    const preview = document.getElementById('mixed-trait-preview');
    if (preview) {
      preview.innerHTML = `
        <div style="font-family:var(--font-ui);font-size:.82rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:8px">Your Traits</div>
        ${ch.mixedForcedSmall ? '<div class="warn-box" style="margin-bottom:10px">⚠ Your size is forced to <strong>Small</strong> because you selected the Fueglin Small and Nimble Major Trait.</div>' : ''}
        ${majorTraits?.major ? `
          <div style="margin-bottom:8px;padding:10px;background:rgba(201,168,76,0.08);border:1px solid var(--border-gold);border-radius:6px">
            <div style="font-family:var(--font-ui);font-size:.75rem;font-weight:700;color:var(--gold);margin-bottom:3px">${majorTraits.major.name} (Major — from ${ch.mixedAssignment.major})</div>
            <div style="font-size:.85rem">${majorTraits.major.text}</div>
          </div>` : ''}
        ${minorTraits?.minor ? `
          <div style="padding:10px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px">
            <div style="font-family:var(--font-ui);font-size:.75rem;font-weight:700;color:var(--muted);margin-bottom:3px">${minorTraits.minor.name} (Minor — from ${ch.mixedAssignment.minor})</div>
            <div style="font-size:.85rem">${minorTraits.minor.text}</div>
          </div>` : ''}`;
    }
    updateMixedLineageBenefits();
  }
}

function setMixedSubTrait(lgName, traitKey) {
  ch.mixedSubTraits[lgName] = traitKey;
  renderMixedPanel();
}

function getFixedLineageSize(lgName) {
  const lg = LINEAGES.find(l => l.name === lgName);
  if (!lg || !lg.size) return null;
  if (lg.size === 'Small') return 'Small';
  if (lg.size === 'Medium') return 'Medium';
  return null;
}

function hasVariableSizeMixedLineage() {
  return ch.mixedLineage && (ch.mixedLineages.includes('Humans') || ch.mixedLineages.includes('Ozonian'));
}

function isVariableSizeLineage(lgName) {
  return lgName === 'Humans' || lgName === 'Ozonian';
}

function applyMixedSizeRules() {
  if (!ch.mixedLineage) return;

  // Fueglin's Small and Nimble major trait overrides the feature lineage's size.
  if (ch.mixedForcedSmall) {
    ch.sizeChoice = 'Small';
    return;
  }

  const featuresLineage = ch.mixedAssignment?.features;
  if (!featuresLineage) return;

  const fixedFeatureSize = getFixedLineageSize(featuresLineage);
  if (hasVariableSizeMixedLineage() && fixedFeatureSize && !isVariableSizeLineage(featuresLineage)) {
    ch.sizeChoice = fixedFeatureSize;
  }
}

function setMixedAssignment(field, lgName) {
  ch.mixedAssignment[field] = lgName;

  if (field === 'features') {
    // If Human/Ozonian provide the Features, the player chooses Small or Medium.
    // If a fixed-size lineage provides the Features, that lineage controls size.
    ch.sizeChoice = isVariableSizeLineage(lgName) ? null : ch.sizeChoice;
    // Don't reset dryvornBloodline — it persists as long as Dryvorn is in the selected lineages
  }

  // Special rule: if Fueglin's Small and Nimble is selected as Major Trait, force Small size
  if (field === 'major') {
    const sub = ch.mixedSubTraits[lgName];
    const traits = getLineageTraits(lgName, sub);
    if (traits?.major?.name === 'Small and Nimble') {
      ch.mixedForcedSmall = true;
      ch.sizeChoice = 'Small';
      // Show alert informing the player
      setTimeout(() => {
        alert('Small and Nimble (Fueglin Major Trait): When taken in a Mixed Lineage, your creature size becomes Small. Your character size has been set to Small.');
      }, 50);
    } else {
      ch.mixedForcedSmall = false;
    }
  }

  applyMixedSizeRules();
  renderMixedPanel();
  renderLineageDetail();
  updateMixedLineageBenefits();
}

function updateMixedLineageBenefits() {
  if (!ch.mixedLineage || ch.mixedLineages.length < 2) return;
  const maj = ch.mixedAssignment.major;
  const min = ch.mixedAssignment.minor;
  if (!maj || !min) return;
  const majSub = ch.mixedSubTraits[maj];
  const minSub = ch.mixedSubTraits[min];

  // For Dryvorn as major source, use bloodline-specific text
  let majTraits;
  if (maj === 'Dryvorn') {
    majTraits = getDryvornText('Dryvorn') || getLineageTraits(maj, majSub);
  } else {
    majTraits = getLineageTraits(maj, majSub);
  }
  // For Pridae as major source, override major text with chosen evolved purpose
  if (maj === 'Pridae' && ch.evolvedPurpose) {
    const pp = PRIDAE_PURPOSES.find(p => p.key === ch.evolvedPurpose);
    if (pp) {
      majTraits = { ...majTraits, major: { name: 'Evolved Purpose — ' + pp.key, text: pp.desc } };
    }
  }

  // For Dryvorn as minor source, use bloodline-specific minor text
  let minTraits;
  if (min === 'Dryvorn') {
    minTraits = getDryvornText('Dryvorn') || getLineageTraits(min, minSub);
  } else {
    minTraits = getLineageTraits(min, minSub);
  }
  ch.lineageBenefits = '';
  if (majTraits?.major) ch.lineageBenefits += majTraits.major.name + ' (Major Trait from ' + maj + '): ' + majTraits.major.text;
  if (minTraits?.minor) ch.lineageBenefits += (ch.lineageBenefits ? '\n\n' : '') + minTraits.minor.name + ' (Minor Trait from ' + min + '): ' + minTraits.minor.text;
}



function selectLineage(name) {
  ch.lineage = name;
  ch.lineageTrait = null;
  ch.undeadRepurposedLineage = null;
  ch.sizeChoice = null;
  ch.ozonianLanguage = null;
  renderLineageGrid();
  renderLineageDetail();
}

// Get the effective major/minor traits for the current lineage (and sub-trait if any)
function getLineageTraits(lgName, subTrait) {
  const lg = LINEAGES.find(l => l.name === lgName);
  if (!lg) return null;
  if (lg.traitDetails && subTrait && lg.traitDetails[subTrait]) {
    return { major: lg.traitDetails[subTrait].major, minor: lg.traitDetails[subTrait].minor };
  }
  return { major: lg.major, minor: lg.minor };
}

// Format a lineage's traits as separate HTML paragraphs
function formatTraitParagraphs(lgName, subTrait) {
  const lg = LINEAGES.find(l => l.name === lgName);
  if (!lg) return '';

  // Otherworldly lineages: show all traits without Major/Minor labels
  // Dryvorn: inject chosen bloodline into trait descriptions
    // getDryvornText defined globally below

  if (lg.otherworldlyTraits) {
    return lg.otherworldlyTraits.map((t, i) => `
      <div style="${i < lg.otherworldlyTraits.length - 1 ? 'margin-bottom:10px' : ''}">
        <div style="font-family:var(--font-ui);font-size:.78rem;font-weight:700;text-transform:uppercase;color:var(--accent-dk);letter-spacing:.05em;margin-bottom:3px">
          ${t.name}
        </div>
        <div style="font-size:.88rem;line-height:1.5">${t.text}</div>
      </div>`).join('');
  }

  // Traditional lineages: show Major / Minor labels
  const traits = getLineageTraits(lgName, subTrait);
  if (!traits) return '';
  let html = '';
  if (traits.major) {
    html += `<div style="margin-bottom:10px">
      <div style="font-family:var(--font-ui);font-size:.78rem;font-weight:700;text-transform:uppercase;color:var(--accent-dk);letter-spacing:.05em;margin-bottom:3px">
        ${traits.major.name} <span style="color:var(--gold);font-size:.7rem">(Major Trait)</span>
      </div>
      <div style="font-size:.88rem;line-height:1.5">${traits.major.text}</div>
    </div>`;
  }
  if (traits.minor) {
    html += `<div>
      <div style="font-family:var(--font-ui);font-size:.78rem;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.05em;margin-bottom:3px">
        ${traits.minor.name} <span style="font-size:.7rem">(Minor Trait)</span>
      </div>
      <div style="font-size:.88rem;line-height:1.5">${traits.minor.text}</div>
    </div>`;
  }
  return html;
}



const DRYVORN_BLOODLINES = [
  {name:'Ravano',  color:'Red',    damage:'Fire'},
  {name:'Golgun',  color:'Green',  damage:'Acid'},
  {name:'Voivern', color:'Black',  damage:'Necrotic'},
  {name:'Sargon',  color:'Yellow', damage:'Radiant'},
  {name:'Byvern',  color:'White',  damage:'Frost'},
  {name:'Thundron',color:'Blue',   damage:'Electric'},
];


const PRIDAE_PURPOSES = [
  {
    key: 'Hardened Shell',
    desc: 'Your carapace has hardened beyond that of your kin. Your max DP when wearing armor is increased by 5.',
  },
  {
    key: 'Small Wings',
    desc: 'You have grown a small set of wings on your back. As a Quick action you can gain a Fly Speed equal to your base Speed until the end of your turn.',
  },
  {
    key: 'Enhanced Antennae',
    desc: 'Your antennae have grown acutely sensitive. You can telepathically speak with any creature within 30 feet of you.',
  },
];

function isPridae() {
  // True if Pridae major trait applies: direct lineage, mixed with Pridae as major, or undead repurposed from Pridae
  if (ch.lineage === 'Pridae') return true;
  if (ch.mixedLineage && ch.mixedAssignment?.major === 'Pridae') return true;
  if (ch.lineage === 'Undead' && ch.undeadRepurposedLineage === 'Pridae') return true;
  return false;
}

function setPrideaPurpose(key) {
  ch.evolvedPurpose = ch.evolvedPurpose === key ? null : key;
  renderLineageDetail();
  updateLineageBenefits();
  renderStatusPoints && renderStatusPoints();
}

function renderPrideaPurposePicker() {
  const sel = ch.evolvedPurpose;
  let html = '<div style="margin-top:16px;background:var(--card-bg);border:1px solid var(--border-gold);border-radius:var(--r);padding:16px">';
  html += '<div style="font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--gold);margin-bottom:6px">Evolved Purpose — Choose One</div>';
  html += '<p style="font-family:var(--font-ui);font-size:.82rem;color:var(--text-dim);margin-bottom:12px">Select one of the following traits for your Pridae lineage.</p>';
  html += '<div style="display:flex;flex-direction:column;gap:8px">';
  PRIDAE_PURPOSES.forEach(p => {
    const isSel = sel === p.key;
    html += '<button onclick="setPrideaPurpose(\'' + p.key + '\')" style="text-align:left;padding:10px 14px;border-radius:6px;cursor:pointer;'
      + 'border:1px solid ' + (isSel ? 'var(--gold)' : 'var(--border)') + ';'
      + 'background:' + (isSel ? 'rgba(201,168,76,0.1)' : 'var(--surface)') + ';'
      + 'color:' + (isSel ? 'var(--gold-pale)' : 'var(--text)') + '">'
      + '<strong style="font-family:var(--font-ui);font-size:.88rem">' + p.key + (isSel ? ' ✓' : '') + '</strong>'
      + '<div style="font-size:.82rem;color:' + (isSel ? 'var(--text)' : 'var(--text-dim)') + ';margin-top:3px;line-height:1.4">' + p.desc + '</div>'
      + '</button>';
  });
  html += '</div>';
  if (!sel) html += '<div class="warn-box" style="margin-top:10px">Choose your Evolved Purpose before continuing.</div>';
  else html += '<div class="info-box" style="margin-top:10px">✓ ' + sel + ' selected.</div>';
  html += '</div>';
  return html;
}

function renderLineageDetail() {
  if (!ch.lineage && !ch.mixedLineage) return;
  const effectiveLineageName = getEffectiveLineageName();
  const lg = LINEAGES.find(l=>l.name===effectiveLineageName);
  if (!lg) return;
  const detail = document.getElementById('lineage-detail');
  detail.style.display = 'block';

  // In mixed lineage mode, sub-groups are handled in the mixed block below
  const hasSubTraits = !ch.mixedLineage && lg.traits.length > 1 && lg.traitDetails;

  // Base info card
  let html = `
    <div class="option-card selected" style="cursor:default;margin-bottom:${hasSubTraits?'16px':'0'}">
      <div class="card-title" style="font-size:1.1rem">${lg.name} - Features</div>
      <div class="card-stats" style="margin:8px 0">
        <span class="stat-badge size">Size: ${lg.size}</span>
        <span class="stat-badge">Height: ${lg.height}</span>
        <span class="stat-badge">Speed: ${lg.speed} ft</span>
        <span class="stat-badge">Speaks: ${getLineageLangs(lg).speak.join(', ')}</span>
        <span class="stat-badge">Reads: ${getLineageLangs(lg).read.join(', ')}</span>
      </div>
      <div style="margin-top:12px">${formatTraitParagraphs(lg.name, ch.lineageTrait)}</div>
    </div>`;

  // Pridae Evolved Purpose picker — only for direct Pridae (not mixed/undead, those handled below)
  if (ch.lineage === 'Pridae' && !ch.mixedLineage) {
    html += renderPrideaPurposePicker();
  }

  // Sub-trait chooser for Abysian and Sylvanik
  if (hasSubTraits) {
    html += `
      <div style="margin-bottom:8px">
        <div style="font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--accent-dk);margin-bottom:10px">
          Choose your ${lg.name} sub-group:
        </div>
        <div class="option-grid cols2">
          ${lg.traits.map(traitKey => {
            const td = lg.traitDetails[traitKey];
            const isSelected = ch.lineageTrait === traitKey;
            return `
              <div class="option-card ${isSelected?'selected':''}" onclick="selectLineageTrait('${traitKey}')">
                <div class="card-title">${td.label}</div>
                <div class="card-body" style="margin-bottom:8px">${td.desc}</div>
                <div style="margin-top:8px">${formatTraitParagraphs(lg.name, traitKey)}</div>
              </div>`;
          }).join('')}
        </div>
        ${!ch.lineageTrait ? '<div class="warn-box" style="margin-top:10px">Please choose a sub-group before continuing.</div>' : ''}
      </div>`;
  }

  // Human / Ozonian: choose Small or Medium
  // For mixed lineage: show sub-group + special pickers for both lineages
  if (ch.mixedLineage) {
    ch.mixedLineages.forEach(lgName => {
      const mlg = LINEAGES.find(l => l.name === lgName);
      if (!mlg) return;
      // Sub-group pickers (Abysian/Sylvanik)
      if (mlg.traits.length > 1 && mlg.traitDetails) {
        const subChosen = ch.mixedSubTraits[lgName];
        html += `<div style="margin-top:16px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px">
          <div style="font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--accent-dk);margin-bottom:6px">
            ${lgName} Sub-group
          </div>
          <p style="font-family:var(--font-ui);font-size:.82rem;color:var(--muted);margin-bottom:10px">
            Choose your ${lgName} variant.
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            ${mlg.traits.map(tk => {
              const td = mlg.traitDetails[tk];
              return '<div class="option-card ' + (subChosen===tk?'selected':'') + '" '
                + 'onclick="setMixedSubTrait(\''+lgName+'\',\''+tk+'\''+')" '
                + 'style="flex:1;min-width:140px;padding:12px;cursor:pointer">'
                + '<div style="font-family:var(--font-ui);font-weight:700;font-size:.88rem;color:var(--accent-dk)">' + td.label + '</div>'
                + '<div style="font-family:var(--font-ui);font-size:.75rem;color:var(--muted);margin-top:3px">' + td.desc + '</div>'
                + '</div>';
            }).join('')}
          </div>
          ${!subChosen ? '<div class="warn-box" style="margin-top:10px">Please choose a sub-group to continue.</div>' : ''}
          ${subChosen ? '<div class="info-box" style="margin-top:10px">' + mlg.traitDetails[subChosen].label + ' selected.</div>' : ''}
        </div>`;
      }
      // Dryvorn bloodline
      if (lgName === 'Dryvorn') {
        html += renderDryvornBloodlineHtml('Dryvorn');
      }
    });
  } else if (ch.lineage === 'Dryvorn') {
    html += renderDryvornBloodlineHtml(null);
  }

  const needsSizeChoice = ch.mixedLineage
    ? (ch.mixedAssignment.features === 'Humans' || ch.mixedAssignment.features === 'Ozonian'
       || ch.mixedLineages.some(l => l === 'Humans' || l === 'Ozonian'))
    : (ch.lineage === 'Humans' || ch.lineage === 'Ozonian');
  if (needsSizeChoice) {
    const variableSizeName = ch.mixedLineage
      ? (ch.mixedLineages.includes('Humans') ? 'Humans' : 'Ozonians')
      : ch.lineage;
    const featureSizeLock = ch.mixedLineage && ch.mixedAssignment?.features && !isVariableSizeLineage(ch.mixedAssignment.features)
      ? getFixedLineageSize(ch.mixedAssignment.features)
      : null;
    const sizeHelpText = featureSizeLock
      ? `${ch.mixedAssignment.features} Features set your size to ${featureSizeLock}. Choosing the other size will clear that Features choice.`
      : `${variableSizeName} can range from 3-6 feet tall and may be classified as Small or Medium.`;
    html += `
      <div style="margin-top:16px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px">
        <div style="font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--accent-dk);margin-bottom:6px">
          Choose Your Size
        </div>
        <p style="font-family:var(--font-ui);font-size:.82rem;color:var(--muted);margin-bottom:12px">
          ${sizeHelpText}
        </p>
        <div style="display:flex;gap:12px">
          <div class="option-card ${ch.sizeChoice==='Small'?'selected':''}"
               onclick="setSizeChoice('Small')"
               style="flex:1;text-align:center;padding:14px;cursor:pointer">
            <div style="font-family:var(--font-ui);font-weight:700;font-size:1rem;color:var(--accent-dk)">Small</div>
            <div style="font-family:var(--font-ui);font-size:.8rem;color:var(--muted);margin-top:4px">3'–4' tall</div>
          </div>
          <div class="option-card ${ch.sizeChoice==='Medium'?'selected':''}"
               onclick="setSizeChoice('Medium')"
               style="flex:1;text-align:center;padding:14px;cursor:pointer">
            <div style="font-family:var(--font-ui);font-weight:700;font-size:1rem;color:var(--accent-dk)">Medium</div>
            <div style="font-family:var(--font-ui);font-size:.8rem;color:var(--muted);margin-top:4px">4'–6' tall</div>
          </div>
        </div>
        ${!ch.sizeChoice ? '<div class="warn-box" style="margin-top:10px">Please choose a size to continue.</div>' : ''}
      </div>`;
  }

  // Ozonian: choose the one traditional language they speak and read
  if (effectiveLineageName === 'Ozonian') {
    html += renderOzonianLanguageHtml();
  }

  // Undead: pick a Traditional lineage for Repurposed (gains that lineage's major trait)
  if (ch.lineage === 'Undead') {
    const traditionals = LINEAGES.filter(l => l.type === 'Traditional');
    html += `
      <div style="margin-top:16px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px">
        <div style="font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--accent-dk);margin-bottom:6px">
          Repurposed — Choose your Original Lineage
        </div>
        <p style="font-family:var(--font-ui);font-size:.82rem;color:var(--muted);margin-bottom:12px">
          Your body was originally from one of the Traditional Lineages. You gain that lineage's Major Trait.
        </p>
        <div class="option-grid cols4" style="gap:8px">
          ${traditionals.map(lg => {
            const majorName = lg.traitDetails
              ? Object.values(lg.traitDetails)[0]?.major?.name || '?'
              : (lg.major?.name || '?');
            const isSelected = ch.undeadRepurposedLineage === lg.name;
            return '<div class="option-card ' + (isSelected?'selected':'') + '" '
              + 'onclick="setUndeadRepurposed(\'' + lg.name + '\')" '
              + 'style="padding:10px 12px;cursor:pointer">'
              + '<div class="card-title" style="font-size:.88rem">' + lg.name + '</div>'
              + '<div style="font-family:var(--font-ui);font-size:.73rem;color:var(--muted);margin-top:3px">' + majorName + '</div>'
              + '</div>';
          }).join('')}
        </div>
        ${ch.undeadRepurposedLineage ? (() => {
          const repLgPreview = LINEAGES.find(l => l.name === ch.undeadRepurposedLineage);
          // Get the major trait - handle sub-group lineages by showing all options or the selected one
          let majorHtml = '';
          if (repLgPreview) {
            if (repLgPreview.traitDetails) {
              const subKey = 'undead_' + repLgPreview.name;
              const chosenSub = ch.mixedSubTraits && ch.mixedSubTraits[subKey];
              if (chosenSub && repLgPreview.traitDetails[chosenSub]) {
                const t = repLgPreview.traitDetails[chosenSub].major;
                majorHtml = t
                  ? '<div style="margin-top:10px;padding:10px;background:rgba(201,168,76,0.08);border:1px solid var(--border-gold);border-radius:6px">'
                    + '<div style="font-family:var(--font-ui);font-size:.75rem;font-weight:700;color:var(--gold);margin-bottom:4px">Repurposed Major Trait (' + repLgPreview.name + ' — ' + chosenSub + ')</div>'
                    + '<div style="font-family:var(--font-ui);font-size:.82rem;font-weight:700;margin-bottom:3px">' + t.name + '</div>'
                    + '<div style="font-size:.85rem;line-height:1.45">' + t.text + '</div>'
                    + '</div>'
                  : '';
              } else {
                majorHtml = '<div class="info-box" style="margin-top:10px">Choose a sub-group below to see your Major Trait.</div>';
              }
            } else if (repLgPreview.name === 'Dryvorn') {
              const dryvornT = getDryvornText('Dryvorn');
              if (dryvornT && dryvornT.major) {
                majorHtml = '<div style="margin-top:10px;padding:10px;background:rgba(201,168,76,0.08);border:1px solid var(--border-gold);border-radius:6px">'
                  + '<div style="font-family:var(--font-ui);font-size:.75rem;font-weight:700;color:var(--gold);margin-bottom:4px">Repurposed Major Trait (Dryvorn — ' + ch.dryvornBloodline + ' Bloodline)</div>'
                  + '<div style="font-family:var(--font-ui);font-size:.82rem;font-weight:700;margin-bottom:3px">' + dryvornT.major.name + '</div>'
                  + '<div style="font-size:.85rem;line-height:1.45">' + dryvornT.major.text + '</div>'
                  + '</div>';
              } else {
                majorHtml = '<div class="info-box" style="margin-top:10px">Choose a Bloodline below to see your Major Trait.</div>';
              }
            } else {
              const t = repLgPreview.major;
              majorHtml = t
                ? '<div style="margin-top:10px;padding:10px;background:rgba(201,168,76,0.08);border:1px solid var(--border-gold);border-radius:6px">'
                  + '<div style="font-family:var(--font-ui);font-size:.75rem;font-weight:700;color:var(--gold);margin-bottom:4px">Repurposed Major Trait (' + repLgPreview.name + ')</div>'
                  + '<div style="font-family:var(--font-ui);font-size:.82rem;font-weight:700;margin-bottom:3px">' + t.name + '</div>'
                  + '<div style="font-size:.85rem;line-height:1.45">' + t.text + '</div>'
                  + '</div>'
                : '';
            }
          }
          return majorHtml;
        })() : '<div class="warn-box" style="margin-top:10px">Please choose an original lineage to continue.</div>'}
      </div>`;
  }

  // For Undead: Pridae evolved purpose picker
  if (ch.lineage === 'Undead' && ch.undeadRepurposedLineage === 'Pridae') {
    html += renderPrideaPurposePicker();
  }

  // For Undead: if repurposed from Human/Ozonian, also offer size choice
  if (ch.lineage === 'Undead' && ch.undeadRepurposedLineage === 'Dryvorn') {
    html += renderDryvornBloodlineHtml('Dryvorn Repurposed');
  }

  // Undead Repurposed: sub-group picker for Abysian/Sylvanik
  if (ch.lineage === 'Undead' && ch.undeadRepurposedLineage) {
    const repLg = LINEAGES.find(l => l.name === ch.undeadRepurposedLineage);
    if (repLg && repLg.traits.length > 1 && repLg.traitDetails) {
      const subKey = 'undead_' + repLg.name;
      const subChosen = ch.mixedSubTraits && ch.mixedSubTraits[subKey];
      html += `<div style="margin-top:16px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px">
        <div style="font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--accent-dk);margin-bottom:6px">
          Choose ${repLg.name} Sub-group (Repurposed)
        </div>
        <p style="font-family:var(--font-ui);font-size:.82rem;color:var(--muted);margin-bottom:12px">
          Your body was originally ${repLg.name}. Choose your variant to determine which Major Trait you gain.
        </p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${repLg.traits.map(tk => {
            const td = repLg.traitDetails[tk];
            return '<div class="option-card ' + (subChosen===tk?'selected':'') + '" '
              + 'onclick="setUndeadRepurposedSub(\''+tk+'\''+')" '
              + 'style="flex:1;min-width:140px;padding:12px;cursor:pointer">'
              + '<div style="font-family:var(--font-ui);font-weight:700;font-size:.88rem;color:var(--accent-dk)">' + td.label + '</div>'
              + '<div style="font-family:var(--font-ui);font-size:.75rem;color:var(--muted);margin-top:2px">' + td.desc + '</div>'
              + '<div style="font-size:.8rem;margin-top:6px;color:var(--accent-dk);font-weight:600">' + (td.major?.name||'') + ' (Major)</div>'
              + '</div>';
          }).join('')}
        </div>
        ${!subChosen ? '<div class="warn-box" style="margin-top:10px">Please choose a sub-group to continue.</div>' : ''}
      </div>`;
    }
  }

  if (ch.lineage === 'Undead' && (ch.undeadRepurposedLineage === 'Humans' || ch.undeadRepurposedLineage === 'Ozonian')) {
    html += `
      <div style="margin-top:16px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px">
        <div style="font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--accent-dk);margin-bottom:6px">
          Choose Your Size (${ch.undeadRepurposedLineage})
        </div>
        <p style="font-family:var(--font-ui);font-size:.82rem;color:var(--muted);margin-bottom:10px">
          Your body was originally from ${ch.undeadRepurposedLineage}. Choose your size.
        </p>
        <div style="display:flex;gap:12px">
          <div class="option-card ${ch.sizeChoice==='Small'?'selected':''}" onclick="setSizeChoice('Small')" style="flex:1;text-align:center;padding:12px;cursor:pointer">
            <div style="font-family:var(--font-ui);font-weight:700">Small</div>
          </div>
          <div class="option-card ${ch.sizeChoice==='Medium'?'selected':''}" onclick="setSizeChoice('Medium')" style="flex:1;text-align:center;padding:12px;cursor:pointer">
            <div style="font-family:var(--font-ui);font-weight:700">Medium</div>
          </div>
        </div>
        ${!ch.sizeChoice ? '<div class="warn-box" style="margin-top:8px">Please choose a size to continue.</div>' : ''}
      </div>`;
  }

  // For Mixed Lineage: show assignment panel at the bottom after all sub-pickers
  if (ch.mixedLineage && ch.mixedLineages.length === 2) {
    const [lg1name, lg2name] = ch.mixedLineages;
    const lg1 = LINEAGES.find(l => l.name === lg1name);
    const lg2 = LINEAGES.find(l => l.name === lg2name);
    const lg1SubOk = !(lg1?.traitDetails && !ch.mixedSubTraits[lg1name]);
    const lg2SubOk = !(lg2?.traitDetails && !ch.mixedSubTraits[lg2name]);
    const lg1BlOk  = !(lg1name === 'Dryvorn' && !ch.dryvornBloodline);
    const lg2BlOk  = !(lg2name === 'Dryvorn' && !ch.dryvornBloodline);
    const allReady = lg1SubOk && lg2SubOk && lg1BlOk && lg2BlOk;

    if (allReady) {
      const getT = (lgName) => {
        const sub = ch.mixedSubTraits[lgName];
        if (lgName === 'Dryvorn') return getDryvornText(lgName);
        return getLineageTraits(lgName, sub);
      };
      const t1 = getT(lg1name), t2 = getT(lg2name);

      const aBtn = (field, lgName, traitName, traitDesc) => {
        const sel = ch.mixedAssignment[field] === lgName;
        return '<button onclick="setMixedAssignment(\'' + field + '\',\'' + lgName + '\')" '
          + 'style="padding:9px 14px;font-family:var(--font-ui);font-size:.82rem;font-weight:600;cursor:pointer;border-radius:6px;text-align:left;max-width:340px;'
          + 'border:2px solid ' + (sel ? 'var(--cyan)' : 'var(--border)') + ';'
          + 'background:' + (sel ? 'rgba(79,195,247,0.1)' : 'var(--card-bg)') + ';'
          + 'color:' + (sel ? 'var(--cyan)' : 'var(--text)') + '">'
          + '<strong>' + lgName + '</strong> &mdash; <span style="font-size:.8rem;font-weight:600">' + traitName + '</span>'
          + (traitDesc ? '<br><span style="font-size:.75rem;font-weight:400;color:' + (sel ? 'var(--cyan)' : 'var(--text-dim)') + ';line-height:1.3;display:block;margin-top:3px">' + traitDesc + '</span>' : '')
          + '</button>';
      };
      const assignRow = (label, field, opts) =>
        '<div style="margin-bottom:12px">'
        + '<label style="font-family:var(--font-ui);font-size:.82rem;font-weight:700;color:var(--text-dim);text-transform:uppercase;display:block;margin-bottom:6px">' + label + '</label>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap">' + opts.map(o => aBtn(field, o.l, o.t, o.desc||'')).join('') + '</div></div>';

      html += '<div style="margin-top:20px;background:var(--card-bg);border:2px solid var(--cyan);border-radius:var(--r);padding:16px">'
        + '<div style="font-family:var(--font-ui);font-weight:700;font-size:.95rem;color:var(--cyan);margin-bottom:12px">Assign Lineage Benefits</div>'
        + '<p style="font-family:var(--font-ui);font-size:.82rem;color:var(--text-dim);margin-bottom:12px">Choose which lineage provides your Features, Major Trait, and Minor Trait.</p>'
        + assignRow('Features (size, speed, languages)', 'features', [
            {l:lg1name, t:(lg1?.size||'') + ', ' + (lg1?.speed||'') + ' ft', desc: getLineageLangs(lg1).speak.join(', ')},
            {l:lg2name, t:(lg2?.size||'') + ', ' + (lg2?.speed||'') + ' ft', desc: getLineageLangs(lg2).speak.join(', ')},
          ])
        + (ch.mixedForcedSmall ? '<div class="warn-box" style="margin:-4px 0 12px">⚠ Your size is <strong>Small</strong> regardless of Features choice — the Fueglin <strong>Small and Nimble</strong> Major Trait forces Small size. Pick a different Major Trait to use your Features size.</div>' : '')
        + assignRow('Major Trait', 'major', [
            {l:lg1name, t:t1?.major?.name||'(no major)', desc:t1?.major?.text||''},
            {l:lg2name, t:t2?.major?.name||'(no major)', desc:t2?.major?.text||''},
          ])
        + assignRow('Minor Trait', 'minor', [
            {l:lg1name, t:t1?.minor?.name||'(no minor)', desc:t1?.minor?.text||''},
            {l:lg2name, t:t2?.minor?.name||'(no minor)', desc:t2?.minor?.text||''},
          ])
        + (ch.mixedAssignment.features && ch.mixedAssignment.major && ch.mixedAssignment.minor
            ? '<div class="info-box" style="margin-top:10px">Assignment complete.</div>'
            : '<div class="warn-box" style="margin-top:10px">Choose a lineage for each row above.</div>')
        + '</div>';
    } else {
      html += '<div class="warn-box" style="margin-top:20px">Complete all sub-group and bloodline selections above before assigning traits.</div>';
    }
    // Show Pridae purpose picker in mixed mode when Pridae is the major source
    if (ch.mixedAssignment?.major === 'Pridae') {
      html += renderPrideaPurposePicker();
    }
  }

  detail.innerHTML = html;
  updateLineageBenefits();
}


function renderDryvornBloodlineHtml(contextLabel) {
  const chosen = ch.dryvornBloodline;
  return `<div style="margin-top:16px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px">
    <div style="font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--accent-dk);margin-bottom:6px">
      Choose Dragon Bloodline${contextLabel ? ' (' + contextLabel + ')' : ''}
    </div>
    <p style="font-family:var(--font-ui);font-size:.82rem;color:var(--muted);margin-bottom:12px">
      Your bloodline determines your Dragon Breath damage type and Dragon Resistance.
    </p>
    <div class="option-grid cols3" style="gap:8px">
      ${DRYVORN_BLOODLINES.map(bl => `
        <div class="option-card ${chosen===bl.name?'selected':''}"
             onclick="setDryvornBloodline('${bl.name}')"
             style="padding:10px 12px;cursor:pointer;text-align:center">
          <div style="font-family:var(--font-ui);font-weight:700;font-size:.88rem;color:var(--accent-dk)">${bl.name}</div>
          <div style="font-family:var(--font-ui);font-size:.75rem;color:var(--muted);margin-top:2px">${bl.color} | ${bl.damage}</div>
        </div>`).join('')}
    </div>
    ${!chosen ? '<div class="warn-box" style="margin-top:10px">Please choose a bloodline to continue.</div>'
              : '<div class="info-box" style="margin-top:10px">Dragon Breath damage: <strong>' + (DRYVORN_BLOODLINES.find(b=>b.name===chosen)?.damage||'') + '</strong> | Resistance: <strong>' + (DRYVORN_BLOODLINES.find(b=>b.name===chosen)?.damage||'') + '</strong></div>'}
  </div>`;
}

function setDryvornBloodline(name) {
  ch.dryvornBloodline = name;
  renderLineageDetail();
}

function setSizeChoice(size) {
  if (ch.mixedLineage && ch.mixedForcedSmall && size !== 'Small') {
    // Choosing Medium de-selects the Fueglin Small and Nimble Major Trait
    ch.mixedForcedSmall = false;
    ch.mixedAssignment.major = null;
    ch.sizeChoice = size;
    alert('Small and Nimble (Fueglin Major Trait) requires Small size — it has been de-selected. Choose a new Major Trait.');
    updateMixedLineageBenefits();
    renderMixedPanel();
    renderLineageDetail();
    return;
  }

  ch.sizeChoice = size;

  if (ch.mixedLineage && hasVariableSizeMixedLineage()) {
    const featuresLineage = ch.mixedAssignment?.features;
    const fixedFeatureSize = getFixedLineageSize(featuresLineage);

    // A manual Human/Ozonian Small/Medium choice cannot coexist with a fixed-size
    // non-Human/Ozonian Features source of the opposite size. Clear Features so the
    // player can intentionally pick Human/Ozonian Features or a compatible fixed-size lineage.
    if (featuresLineage && fixedFeatureSize && fixedFeatureSize !== size && !isVariableSizeLineage(featuresLineage)) {
      ch.mixedAssignment.features = null;
      updateMixedLineageBenefits();
    }

    renderMixedPanel();
    renderLineageDetail();
    return;
  }

  renderLineageDetail();
}

function setUndeadRepurposedSub(subKey) {
  if (!ch.mixedSubTraits) ch.mixedSubTraits = {};
  const repLg = ch.undeadRepurposedLineage;
  ch.mixedSubTraits['undead_' + repLg] = subKey;
  updateLineageBenefits();
  renderLineageDetail();
}

function setUndeadRepurposed(lgName) {
  ch.undeadRepurposedLineage = lgName;
  if (lgName === 'Humans' || lgName === 'Ozonian') {
    ch.sizeChoice = null;
  }
  if (lgName !== 'Dryvorn') {
    ch.dryvornBloodline = null;
  }
  renderLineageDetail();
}

function selectLineageTrait(traitKey) {
  ch.lineageTrait = traitKey;
  renderLineageDetail();
}

function renderOzonianLanguageHtml() {
  const picked = ch.ozonianLanguage;
  const script = picked ? getReadScript(picked) : null;
  const outcome = picked
    ? `<div class="info-box" style="margin-top:12px">
         You speak <strong>${esc(picked)}</strong> and read the <strong>${esc(script)}</strong> script.
       </div>`
    : '<div class="warn-box" style="margin-top:12px">Please choose a language to continue.</div>';

  return `
    <div style="margin-top:16px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px">
      <div style="font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--accent-dk);margin-bottom:6px">
        Choose Your Traditional Language
      </div>
      <p style="font-family:var(--font-ui);font-size:.82rem;color:var(--muted);margin-bottom:12px">
        Ozonians learn to speak and read one traditional language of their choice, on top of Gaian.
      </p>
      <select class="full" style="max-width:260px" onchange="setOzonianLanguage(this.value)">
        <option value="">-- choose --</option>
        ${getOzonianLanguageOptions().map(l =>
          `<option value="${esc(l)}" ${picked === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}
      </select>
      ${outcome}
    </div>`;
}

// Global helper: get bloodline-specific trait text for Dryvorn
function getDryvornText(lgName) {
  if (lgName !== 'Dryvorn' || !ch.dryvornBloodline) return null;
  const bl = DRYVORN_BLOODLINES.find(b => b.name === ch.dryvornBloodline);
  if (!bl) return null;
  return {
    major: {name:'Dragon Breath',
            text:'You can spend a Standard action and three Sorce Points to exhale a 15-foot cone or 30-foot line breath attack. The damage type is ' + bl.damage + ' (' + bl.name + ' bloodline). The breath deals 12 damage. Creatures hit can make a Move save to reduce damage.'},
    minor: {name:'Dragon Resistance',
            text:'Your HP gains resistance to ' + bl.damage + ' damage (' + bl.name + ' bloodline).'},
  };
}


function updateLineageBenefits() {
  if (ch.mixedLineage) {
    updateMixedLineageBenefits();
    return;
  }
  if (!ch.lineage) return;
  const effectiveLineageName = getEffectiveLineageName();
  const lg = LINEAGES.find(l=>l.name===effectiveLineageName);
  if (!lg) return;
  if (lg.otherworldlyTraits) {
    // Undead: replace Repurposed trait text with the actual chosen lineage's major trait
    let traits = [...lg.otherworldlyTraits];
    if (ch.lineage === 'Undead' && ch.undeadRepurposedLineage) {
      const origLg = LINEAGES.find(l => l.name === ch.undeadRepurposedLineage);
      if (origLg) {
        let majorName = '', majorText = '';
        if (origLg.name === 'Dryvorn') {
          // Use bloodline-specific Dryvorn text
          const dryvornT = getDryvornText('Dryvorn');
          if (dryvornT) { majorName = dryvornT.major.name; majorText = dryvornT.major.text; }
          else { majorName = origLg.major?.name || ''; majorText = origLg.major?.text || ''; }
        } else if (origLg.name === 'Pridae' && ch.evolvedPurpose) {
          // Use chosen Evolved Purpose
          const pp = PRIDAE_PURPOSES.find(p => p.key === ch.evolvedPurpose);
          majorName = 'Evolved Purpose — ' + (pp ? pp.key : '');
          majorText = pp ? pp.desc : '';
        } else {
          const subKey = ch.mixedSubTraits && ch.mixedSubTraits['undead_' + origLg.name];
          const origTraits = origLg.traitDetails
            ? origLg.traitDetails[subKey || Object.keys(origLg.traitDetails)[0]]
            : origLg;
          majorName = origTraits?.major?.name || '';
          majorText = origTraits?.major?.text || '';
        }
        traits = traits.map(t =>
          t.name === 'Repurposed'
            ? {name: 'Repurposed (from ' + ch.undeadRepurposedLineage + ')',
               text: majorName + ': ' + majorText}
            : t
        );
      }
    }
    ch.lineageBenefits = traits.map(t => t.name + ': ' + t.text).join('\n\n');
  } else {
    const dryvornOverride = getDryvornText(ch.lineage);
    const traits = dryvornOverride || getLineageTraits(ch.lineage, ch.lineageTrait);
    let text = lg.name + ' Lineage:\n';
    if (traits?.major) text += traits.major.name + ' (Major Trait): ' + traits.major.text;
    if (traits?.minor) text += '\n\n' + traits.minor.name + ' (Minor Trait): ' + traits.minor.text;
    ch.lineageBenefits = text;
  }
  // Append evolved purpose if Pridae
  if (isPridae() && ch.evolvedPurpose) {
    const pp = PRIDAE_PURPOSES.find(p => p.key === ch.evolvedPurpose);
    if (pp) {
      const purposeText = 'Evolved Purpose — ' + pp.key + ': ' + pp.desc;
      ch.lineageBenefits = ch.lineageBenefits
        ? ch.lineageBenefits + '\n\n' + purposeText
        : purposeText;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// STEP 4 - CLASS
// ═══════════════════════════════════════════════════════════════
function renderClassGrid() {
  const container = document.getElementById('class-grid');
  container.innerHTML = CLASSES.map(cls => `
    <div class="option-card ${ch.cls===cls.name?'selected':''}" onclick="selectClass('${cls.name}')">
      <div class="card-title">${cls.name}</div>
      <div class="card-body">${cls.desc}</div>
      <div class="card-stats" style="margin-top:10px">
        <span class="stat-badge bonus">+1 ${ATTRIBUTES.find(a=>Object.keys(cls.attrBonus)[0]===a.key)?.name || Object.keys(cls.attrBonus)[0]}</span>
        ${cls.skillBonus.map(s=>`<span class="stat-badge bonus">+1 ${s}</span>`).join('')}
        ${cls.spellcasting ? `<span class="stat-badge">Casts with ${cls.spellcasting}</span>` : ''}
      </div>
      <div style="margin-top:8px;font-family:var(--font-ui);font-size:.78rem;color:var(--muted)">Specialties: ${cls.specialties.join(', ')}</div>
    </div>
  `).join('');
}

function selectClass(name) {
  const changingClass = ch.cls !== name;
  ch.cls = name;
  ch.specialty = null;
  if (changingClass) ch.clsSkillChoices = {};
  normalizeBaseChoices();
  renderClassGrid();
  renderClassSkillChoices();
  renderPointBuy();
  updateSkillPips();
}
function renderClassSkillChoices() {
  if (!ch.cls) return;
  const cls = CLASSES.find(c=>c.name===ch.cls);
  const container = document.getElementById('class-skill-choice');
  if (!cls.skillChoice || cls.skillChoice.length === 0) { container.style.display='none'; return; }
  container.style.display = 'block';
  container.innerHTML = `
    <div class="info-box"><strong>${cls.name} Skill Bonuses</strong> - choose which skills to increase:</div>
    ${cls.skillChoice.map((choice, ci) => `
      <div style="margin-bottom:14px">
        <div class="field-label" style="display:block;margin-bottom:8px">${choice.label}</div>
        <div class="skill-grid">
          ${choice.from.map(sk => {
            const chosen = ch.clsSkillChoices[sk];
            // Check if another choice in same group already selected this
            return `
              <div style="display:flex;flex-direction:column;gap:2px">
                <div class="skill-chip ${chosen?'selected class-bonus':''}"
                     onclick="pickClassSkill(${ci}, '${sk}')">
                  <div class="rank-pip">${chosen?'✓':''}</div>
                  ${sk}
                </div>
                <div style="font-size:.82rem;color:var(--muted);padding-left:4px;line-height:1.4">${SKILL_HINTS[sk]||''}</div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `).join('')}
  `;
}

function pickClassSkill(choiceIdx, skillKey) {
  const cls = CLASSES.find(c=>c.name===ch.cls);
  const choice = cls.skillChoice[choiceIdx];

  // Deselect any previously selected skill from this choice group.
  // The actual rank bonus is calculated dynamically by getClassSkillBonus().
  choice.from.forEach(sk => { ch.clsSkillChoices[sk] = false; });

  ch.clsSkillChoices[skillKey] = true;
  renderClassSkillChoices();
  updateSkillPips();
}

// ═══════════════════════════════════════════════════════════════
// STEP 5 - SPECIALTY
// ═══════════════════════════════════════════════════════════════
function renderSpecialtyGrid() {
  const container = document.getElementById('specialty-grid');
  const featureEl = document.getElementById('specialty-feature-display');
  if (!ch.cls) { container.innerHTML = '<p style="color:var(--muted);font-family:var(--font-ui)">Please choose a Class first.</p>'; if(featureEl)featureEl.style.display='none'; return; }
  const cls = CLASSES.find(c=>c.name===ch.cls);
  container.innerHTML = cls.specialties.map(specName => {
    const spec = SPECIALTIES[specName];
    return `
      <div class="option-card ${ch.specialty===specName?'selected':''}" onclick="selectSpecialty('${specName}')">
        <div class="card-title">${specName}</div>
        <div class="card-body">${spec.desc}</div>
        ${spec.resource ? `<div class="card-stats" style="margin-top:8px"><span class="stat-badge">Resource: ${spec.resource}</span></div>` : ''}
      </div>
    `;
  }).join('');
  // Show specialty feature if selected and one exists
  if (featureEl) {
    const feat = ch.specialty ? SPECIALTY_FEATURES[ch.specialty] : null;
    if (feat) {
      featureEl.style.display = 'block';
      featureEl.innerHTML = `
        <div style="background:var(--card-bg);border:1px solid var(--border-gold);border-radius:var(--r);padding:16px">
          <div style="font-family:var(--font-ui);font-weight:700;font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:var(--gold);margin-bottom:8px">
            ${ch.specialty} Specialty Feature (Level 1)
          </div>
          <div style="font-family:var(--font-heading);font-weight:700;font-size:.95rem;color:var(--gold-pale);margin-bottom:4px">${feat.name}</div>
          <div style="font-size:.9rem;color:var(--text);line-height:1.5">${feat.text}</div>
        </div>`;
    } else {
      featureEl.style.display = 'none';
      featureEl.innerHTML = '';
    }
  }
}

const SPECIALTY_TALENT_TEXT = {
  Guardian: 'Armored: Any armor set you wear has its max DP increased by 5.',
  Berserker: 'Thicker Skin: Your max HP is increased by 8.',
  Engineer: 'Tinkerer: You are always considered having a Tool Kit equipped without having to wear one. You can still equip and benefit from another Kit.',
  Pugilist: 'Pugilist Form: As a Pugilist, your Unarmed Strikes have a base damage of 6 Blunt. Your hands in Unarmed Strikes count as 1h melee weapons for the sake of Parries, Off-Hand Attacks, and Martial Talents.',
  Sharpshooter: 'Eagle Eye: Your Ranged Weapon Attacks and throwing distance for Explosives have their max range increased by 20 feet.',
  Elemancer: 'Swift: Your base Speed is increased by 5.',
  Alchemist: 'Mobile Apothecary: You are always considered having an Alchemist Kit equipped without having to wear one. You can still equip and benefit from another Kit.',
  Reaver: 'Soulwell: When a creature dies within 60 feet of you, you can regain up to 3 Sorce.',
  Spellweaver: 'Magic Master: Whenever you cast a spell that lets you make a Spell check, you gain a +1 modifier on the spell check.',
  Warlock: "Patron's Gift: The Study of Sorcery you choose becomes your Patron's Gift, bestowing access to it. Spells from your Patron's Gift cost 1 less Sorce to cast (minimum cost of 1 Sorce).",
  Witch: 'Summon Familiar: During an Intermission, you can summon a loyal servant. You can telepathically speak with your Familiar within 60 ft and cast Spells through it.',
  Oracle: 'Sorce Sense: You can see if a creature or object is emitting magic and make an Analyze check to discern the nature of the magic. You also gain a +1 modifier on Initiative checks.',
  Shapeshifter: 'Animal Form: As a Standard action, you can create and activate an Animal Form for 24 hours.',
  Summoner: 'Spirit Companion: You gain the ability to Summon the Scout Stage 1 Form during an Intermission.',
  Sonneteer: 'Rally: You can spend a Quick Action to give another creature that can hear you a +1 modifier on their next Skill Check. This Bonus will go away after 1 minute has passed if not used.',
  Cleric: 'Blessed Recovery: During an Intermission or Light Rest each Recovery die that you and any number of creatures of your choice sharing that Intermission or Light Rest expend can\'t roll lower than 3.',
};

const SPECIALTY_FEATURES = {
  Guardian:  {name:'Armored',       text:'Any armor set you wear has its max DP increased by 5.'},
  Berserker: {name:'Thicker Skin',  text:'Your max HP is increased by 8.'},
  Engineer:  {name:'Tinkerer',      text:'You are always considered having a Tool Kit equipped without having to wear one. You can still equip and benefit from another Kit.'},
  Pugilist:  {name:'Pugilist Form', text:'As a Pugilist, your Unarmed Strikes have a base damage of 6 Blunt. Your hands in Unarmed Strikes count as 1h melee weapons for the sake of Parries, Off-Hand Attacks, and Martial Talents.'},
  Sharpshooter: {name:'Eagle Eye', text:'Your Ranged Weapon Attacks and throwing distance for Explosives have their max range increased by 20 feet.'},
  Elemancer: {name:'Swift', text:'Your base Speed is increased by 5.'},
  Alchemist: {name:'Mobile Apothecary', text:'You are always considered having an Alchemist Kit equipped without having to wear one. You can still equip and benefit from another Kit.'},
  Reaver: {name:'Soulwell', text:'When a creature dies within 60 feet of you, you can regain up to 3 Sorce.'},
  Spellweaver: {name:'Magic Master', text:'Whenever you cast a spell that lets you make a Spell check, you gain a +1 modifier on the spell check.'},
  Warlock: {name:"Patron's Gift", text:"When you get Rank 1 in this Specialty, you select one Study of Sorcery and learn Rank 1 in it. By making a pact with a greater Patron, <strong>the Study of Sorcery you choose becomes your Patron's Gift</strong>, bestowing access to it and certain effects for that Study. Whenever you cast a spell from your Patron's Gift, it costs 1 less Sorce to cast. This can't bring the Sorce cost to 0."},
  Witch: {name:'Summon Familiar', text:"During an Intermission, you can summon a loyal servant. Choose between the Avian, Mammal/Reptile, or Aquatic Familiar. The Familiar's physiology can look like any Beast as long as it follows the template you choose. You can change the Familiar's template and physiology over the course of an Intermission. You can telepathically speak with your Familiar if it is within 60 feet of you. You can also cast Spells from your Familiar as if you were in its position, but you must have sight of the direction or target of the Spell. If a Familiar is killed, it will need to be resummoned during an Intermission."},
  Oracle: {name:'Sorce Sense', text:'You can see if a creature or object is emitting magic and make an Analyze check to discern the nature of the magic. The GM may impose a Difficulty for these checks. You also gain a +1 modifier on Initiative checks.'},
  Shapeshifter: {name:'Animal Form', text:'As a Standard action, you can create and activate an Animal Form for 24 hours. You can only choose a Size Small until you gain Rank 2 in this specialty. For extended rules on Animal Form, refer to Shapeshifter in the Core Rulebook.'},
  Summoner: {name:'Spirit Companion', text:'You gain the ability to Summon the Scout Stage 1 Form during an Intermission. Refer to the Core Rulebook for the extended rules on Spirit Companion.'},
  Sonneteer: {name:'Rally', text:'You can spend a Quick Action to give another creature that can hear you a +1 modifier on their next Skill Check. This Bonus will go away after 1 minute has passed if not used.'},
  Cleric: {name:'Blessed Recovery', text:"During an Intermission or Light Rest each Recovery die that you and any number of creatures of your choice sharing that Intermission or Light Rest expend can't roll lower than 3."},
};

const WARLOCK_STUDIES = ['Study of Blood', 'Study of Aeromancy', 'Study of Cryomancy', 'Study of Geomancy', 'Study of Divinity', 'Study of Death', 'Study of Pyromancy', 'Study of Contagion', 'Study of Shadows', 'Study of Illusion', 'Study of Recovery', 'Study of Displacement'];

function selectSpecialty(name) {
  const changed = ch.specialty !== name;
  ch.specialty = name;
  ch.specialtyTalent = SPECIALTY_TALENT_TEXT[name] || (name + ' Specialty Talent');
  ch.warlockStudy = null; // reset warlock study on specialty change
  if (changed) resetGearForSpecialty(); // old specialty's gear is invalid for the new one
  renderSpecialtyGrid();
}

// Wipe gear picks and repopulate defaults for the current specialty.
// Without this, gearSelections keeps the OLD specialty's items keyed by slot
// index — the PDF then exports stale gear and the attack table can't match
// weapons. Populating defaults immediately also means the PDF is correct even
// if the user downloads without revisiting the gear step.
function resetGearForSpecialty() {
  ch.gearSelections = {};
  for (let i = 0; i < 6; i++) ch.equip[i] = '';
  const slots = GEAR_OPTIONS[ch.specialty] || [];
  slots.forEach((options, i) => {
    ch.gearSelections[i] = options[0];
    ch.equip[i] = options[0];
  });
  // Sharpshooter: ammo slot must match the default weapon
  if (ch.specialty === 'Sharpshooter') {
    const ammo = SHARPSHOOTER_AMMO_MATCH[ch.gearSelections[0]];
    if (ammo) { ch.gearSelections[1] = ammo; ch.equip[1] = ammo; }
  }
  extractNumericDP();
}

// ═══════════════════════════════════════════════════════════════
// STEP 6 - LIFEPATH
// ═══════════════════════════════════════════════════════════
const lpLastRoll = {};
const LIFEPATH_KEY_MAP = {upbringing:'upbringings', culture:'cultures', personality:'personality', value:'values', upset:'upsets', decisions:'decisions', viewOfOthers:'viewOfOthers'};
function lpRowMatchesRoll(row, n) {
  const r = String(row.roll);
  if (r.includes('-')) { const parts = r.split('-').map(Number); return n >= parts[0] && n <= parts[1]; }
  return Number(r) === n;
}
function rollLifepath(key) {
  const data = LIFEPATH[LIFEPATH_KEY_MAP[key]];
  if (!data) return;
  const die = data.length <= 3 ? 6 : 8;
  const n = 1 + Math.floor(Math.random() * die);
  const row = data.find(r => lpRowMatchesRoll(r, n));
  lpLastRoll[key] = n;
  if (row) {
    ch.lifepathCustom[key] = '';
    ch.lifepath[key] = row.name;
  }
  if (typeof saveLocal === 'function') saveLocal();
  renderLifepath();
}
function rollExtraLanguage() {
  const n = 1 + Math.floor(Math.random() * 6);
  const o = EXTRA_LANGUAGE_OPTIONS.find(r => lpRowMatchesRoll(r, n));
  lpLastRoll.extraLanguage = n;
  if (o) {
    ch.extraLanguage = o.name;
    ch.extraLanguagePicks = [];
    ch.extraLanguageReads = [];
  }
  if (typeof saveLocal === 'function') saveLocal();
  renderLifepath();
}
const TRADITIONAL_LANGUAGES = ['Aquon', 'Draconic', 'ESL', 'Fuegi', 'Gaian', 'Godun', 'Hunon', 'Prado', 'Sybus', 'Sylvan'];
const LANGUAGE_SCRIPTS = {
  Fuegi:   'Sylvan',  // Fueglins read Sylvan script
  Hunon:   'Aquon',   // Humans read Aquon script
  Prado:   'Sybus',   // Pridae read Sybus script
  Cosi:    'Etunu',   // Fey read Etunu script
  Necrosis:'Nether',  // Reapers/Undead read Nether script
  Demoid:  'Nether',  // Demons read Nether script
  Solari:  'Eldar',   // Celestials read Eldar script
  Godun:   'Eldar',   // Guodons/Titans read Eldar script
};
// When a language has a different read-script, the READ field uses that script name

const EXOTIC_LANGUAGES       = ['Cosi', 'Demoid', 'Eldar', 'Etunu', 'Necrosis', 'Solari'];

const EXTRA_LANGUAGE_OPTIONS = [
  {roll:1, name:'Commoner',  desc:'Learn to speak and read one traditional language of your choice.',
    picks:{speak:1, read:1, pool:'traditional'}},
  {roll:2, name:'Scholar',   desc:'Learn to speak and read one exotic language of your choice.',
    picks:{speak:1, read:1, pool:'exotic'}},
  {roll:3, name:'Wanderer',  desc:'Learn to speak two different traditional languages of your choice.',
    picks:{speak:2, read:0, pool:'traditional'}},
  {roll:4, name:'Mystic',    desc:'Learn to speak one traditional language and one exotic language of your choice.',
    picks:{speak:1, read:0, pool:'traditional', speak2:1, read2:0, pool2:'exotic'}},
  {roll:5, name:'Silent',    desc:'You know how to communicate via Empyrean Sign Language (ESL).',
    picks:null, fixed:{speak:['ESL'], read:[]}},
  {roll:6, name:'Wildling',  desc:'You can speak with Beasts.',
    picks:null, fixed:{speak:['Beast Speech'], read:[]}},
];


function renderLifepath() {
  const container = document.getElementById('lifepath-content');
  const sections = [
    {key:'upbringing',   label:'Upbringing',         data:LIFEPATH.upbringings,    hasDesc:true},
    {key:'culture',      label:'Culture',             data:LIFEPATH.cultures,       hasDesc:true},
    {key:'personality',  label:'Personality',         data:LIFEPATH.personality,    hasDesc:false},
    {key:'value',        label:'What You Value Most', data:LIFEPATH.values,         hasDesc:false},
    {key:'upset',        label:'What Upsets You',     data:LIFEPATH.upsets,         hasDesc:false},
    {key:'decisions',    label:'How You Approach Decisions', data:LIFEPATH.decisions, hasDesc:true},
    {key:'viewOfOthers', label:'How You View Others', data:LIFEPATH.viewOfOthers,   hasDesc:true},
  ];

  container.innerHTML = sections.map(sec => {
    const selectedOption = ch.lifepath[sec.key] || '';
    const customText = ch.lifepathCustom[sec.key] || '';
    const badge = customText.trim()
      ? `<span class="lp-selected-badge" data-lifepath-badge="${sec.key}">✓ Custom</span>`
      : (selectedOption ? `<span class="lp-selected-badge" data-lifepath-badge="${sec.key}">✓ ${esc(selectedOption)}</span>` : `<span data-lifepath-badge="${sec.key}"></span>`);

    return `
    <div style="margin-bottom:28px" data-lifepath-section="${sec.key}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <h3 style="font-family:var(--font-ui);font-size:1rem;font-weight:700;color:var(--accent-dk);margin:0">${sec.label}</h3>
        <button class="btn btn-secondary" style="padding:4px 12px;font-size:.75rem" onclick="rollLifepath('${sec.key}')">🎲 Roll 1d${sec.data.length <= 3 ? 6 : 8}</button>
        ${lpLastRoll[sec.key] ? `<span style="font-family:var(--font-heading);font-size:.78rem;color:var(--gold)">Rolled: ${lpLastRoll[sec.key]}</span>` : ''}
      </div>
      <p style="font-family:var(--font-ui);font-size:.82rem;color:var(--muted);margin-bottom:10px">
        Click a row to select it${sec.key === 'culture' ? ', or type a custom culture below. Typing a custom culture clears the table selection' : ''}.
      </p>
      <div style="margin-bottom:10px;min-height:0">${badge}</div>
      <table class="lp-table">
        <thead><tr><th>${sec.data.length <= 3 ? '1d6' : '1d8'}</th><th>Option</th>${sec.hasDesc?'<th>Description</th>':''}</tr></thead>
        <tbody>
          ${sec.data.map(row => `
            <tr data-lifepath-row="${esc(sec.key)}"
                data-lifepath-value="${esc(row.name)}"
                class="${selectedOption===row.name && !customText.trim()?'lp-selected':''}"
                role="button" tabindex="0">
              <td class="roll">${row.roll}</td>
              <td class="opt-name" style="${sec.hasDesc?'':' width:100%'}">${esc(row.name)}</td>
              ${sec.hasDesc?`<td>${esc(row.desc||'')}</td>`:''}
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${sec.key === 'culture' ? `<div>
        <label class="field-label">Custom Culture</label>
        <input type="text" value="${esc(customText)}" 
               oninput="setLifepathCustom('${sec.key}', this.value)"
               placeholder="Custom answer">
      </div>` : ''}
    </div>`;
  }).join('');

  // Append Extra Languages section
  const extraLangHtml = renderExtraLanguagesHtml();
  container.innerHTML += extraLangHtml;
  bindLifepathEvents();
}

function autoGrowTA(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight + 4) + 'px';
}

function bindLifepathEvents() {
  document.querySelectorAll('#lifepath-content [data-lifepath-row][data-lifepath-value]').forEach(row => {
    const handler = () => {
      selectLifepath(row.dataset.lifepathRow, row.dataset.lifepathValue);
    };
    row.addEventListener('click', handler);
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler();
      }
    });
  });
}

function renderExtraLanguagesHtml() {
  const sel = ch.extraLanguage;
  const opt = sel ? EXTRA_LANGUAGE_OPTIONS.find(o => o.name === sel) : null;
  let pickerHtml = '';

  if (opt) {
    if (opt.fixed) {
      ch.extraLanguagePicks = [...opt.fixed.speak];
      ch.extraLanguageReads = [...opt.fixed.read];
      pickerHtml = `<div class="info-box" style="margin-top:10px">
        You gain: <strong>${opt.fixed.speak.join(', ')}</strong> (spoken)
      </div>`;
    } else if (opt.picks) {
      const p = opt.picks;
      const makePicker = (idx, pool, label) => {
        const arr = pool === 'traditional' ? TRADITIONAL_LANGUAGES : EXOTIC_LANGUAGES;
        const val = ch.extraLanguagePicks[idx] || '';
        // Collect languages already spoken from lineage so they can be excluded
        const lg = LINEAGES.find(l => l.name === ch.lineage) || {};
        const lineageSpeak = new Set(getLineageLangs(lg).speak);
        // Also exclude languages already chosen in other slots this session
        const otherPicks = new Set(ch.extraLanguagePicks.filter((l, i) => l && i !== idx));
        const available = arr.filter(l => !lineageSpeak.has(l) && !otherPicks.has(l));
        return `<div style="margin-bottom:8px">
          <label class="field-label">${label}</label>
          <select class="full" onchange="setExtraLanguagePick(${idx}, this.value, '${pool}')"
                  style="max-width:260px">
            <option value="">-- choose --</option>
            ${available.map(l => `<option value="${l}" ${val===l?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>`;
      };
      let pickers = '';
      for (let i = 0; i < (p.speak||0); i++) {
        pickers += makePicker(i, p.pool, `Speak: ${p.pool} language${(p.speak||0)>1?' '+(i+1):''}`);
      }
      if ((p.read||0) > 0 && ch.extraLanguagePicks[0]) {
        ch.extraLanguageReads[0] = ch.extraLanguagePicks[0];
        const scriptName = ch.extraLanguagePicks[0] ? getReadScript(ch.extraLanguagePicks[0]) : null;
        if (scriptName) {
          ch.extraLanguageReads[0] = scriptName;
        }
        pickers += `<div class="info-box" style="margin-top:0;margin-bottom:8px">You also learn to <strong>read</strong> this language's script${scriptName && scriptName !== ch.extraLanguagePicks[0] ? ' (<strong>' + scriptName + '</strong> script)' : ''}.</div>`;
      }
      if (p.pool2) {
        const idx2 = p.speak || 0;
        const val2 = ch.extraLanguagePicks[idx2] || '';
        pickers += `<div style="margin-bottom:8px">
          <label class="field-label">Speak: ${p.pool2} language</label>
          <select class="full" onchange="setExtraLanguagePick(${idx2}, this.value, '${p.pool2}')"
                  style="max-width:260px">
            <option value="">-- choose --</option>
            ${(p.pool2 === 'traditional' ? TRADITIONAL_LANGUAGES : EXOTIC_LANGUAGES).map(l =>
              `<option value="${l}" ${val2===l?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>`;
      }
      pickerHtml = `<div style="margin-top:10px">${pickers}</div>`;
    }
  }

  return `<div style="margin-bottom:28px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <h3 style="font-family:var(--font-ui);font-size:1rem;font-weight:700;color:var(--accent-dk);margin:0">
        Extra Languages Learned
      </h3>
      <button class="btn btn-secondary" style="padding:4px 12px;font-size:.75rem" onclick="rollExtraLanguage()">🎲 Roll 1d6</button>
      ${lpLastRoll.extraLanguage ? `<span style="font-family:var(--font-heading);font-size:.78rem;color:var(--gold)">Rolled: ${lpLastRoll.extraLanguage}</span>` : ''}
    </div>
    <p style="font-family:var(--font-ui);font-size:.82rem;color:var(--muted);margin-bottom:10px">
      Click a row to select your language background.
    </p>
    <div style="margin-bottom:10px">${sel ? '<span class="lp-selected-badge">✓ ' + sel + '</span>' : ''}</div>
    <table class="lp-table">
      <thead><tr><th>1d6</th><th>Background</th><th>Languages Gained</th></tr></thead>
      <tbody>
        ${EXTRA_LANGUAGE_OPTIONS.map(o => `
          <tr class="${sel===o.name?'lp-selected':''}" onclick="selectExtraLanguage('${o.name}')">
            <td class="roll">${o.roll}</td>
            <td class="opt-name">${o.name}</td>
            <td>${o.desc}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    ${pickerHtml}
    <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
      <div>
        <h3 style="font-family:var(--font-ui);font-size:.9rem;font-weight:700;margin-bottom:8px;color:var(--accent-dk)">Traditional Languages</h3>
        <table class="lp-table" style="cursor:default">
          <thead><tr><th>Language</th><th>Typical Speakers</th><th>Script</th></tr></thead>
          <tbody style="pointer-events:none">
            <tr><td class="opt-name">Aquan</td><td>Ocotos</td><td>Aquon</td></tr>
            <tr><td class="opt-name">Draconic</td><td>Dryvorn, Dragons</td><td>Draconic</td></tr>
            <tr><td class="opt-name">ESL (Empyrean Sign Language)</td><td>Gaians, Constructs</td><td>None</td></tr>
            <tr><td class="opt-name">Fuegi</td><td>Fueglins</td><td>Sylvan</td></tr>
            <tr><td class="opt-name">Gaian</td><td>Most Civilizations</td><td>Gaian</td></tr>
            <tr><td class="opt-name">Godun</td><td>Guodons, Titans</td><td>Eldar</td></tr>
            <tr><td class="opt-name">Hunon</td><td>Humans</td><td>Aquon</td></tr>
            <tr><td class="opt-name">Prado</td><td>Pridae</td><td>Sybus</td></tr>
            <tr><td class="opt-name">Sybus</td><td>Abysians</td><td>Sybus</td></tr>
            <tr><td class="opt-name">Sylvan</td><td>Sylvaniks</td><td>Sylvan</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <h3 style="font-family:var(--font-ui);font-size:.9rem;font-weight:700;margin-bottom:8px;color:var(--accent-dk)">Exotic Languages</h3>
        <table class="lp-table" style="cursor:default">
          <thead><tr><th>Language</th><th>Typical Speakers</th><th>Script</th></tr></thead>
          <tbody style="pointer-events:none">
            <tr><td class="opt-name">Cosi</td><td>Fey</td><td>Etunu</td></tr>
            <tr><td class="opt-name">Demoid</td><td>Demons, Virophage</td><td>Nether</td></tr>
            <tr><td class="opt-name">Eldar</td><td>Elementals, Constructs</td><td>Eldar</td></tr>
            <tr><td class="opt-name">Etunu</td><td>Voidspawn</td><td>Etunu</td></tr>
            <tr><td class="opt-name">Necrosis</td><td>Undead</td><td>Nether</td></tr>
            <tr><td class="opt-name">Solari</td><td>Celestials</td><td>Eldar</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function selectExtraLanguage(name) {
  ch.extraLanguage = (ch.extraLanguage === name) ? null : name;
  ch.extraLanguagePicks = [];
  ch.extraLanguageReads = [];
  renderLifepath();
}

function getReadScript(lang) {
  // Return the script name for reading — some languages use a different script
  return LANGUAGE_SCRIPTS[lang] || lang;
}

// A lineage's languages with the Ozonian player's-choice placeholder resolved.
// Until the player picks, the placeholder is left in place so the UI still
// explains that a choice is owed.
function getLineageLangs(lg) {
  const speak = [...(lg?.langs?.speak || [])];
  const read  = [...(lg?.langs?.read  || [])];
  const pick  = ch.ozonianLanguage;
  if (!pick) return {speak, read};
  return {
    speak: speak.map(l => l === PLAYER_CHOICE_LANG ? pick : l),
    read:  read.map(l  => l === PLAYER_CHOICE_LANG ? getReadScript(pick) : l),
  };
}

// Traditional languages an Ozonian may still pick — everything their lineage
// does not already grant outright, minus anything the Lifepath step already
// spent a pick on, so the two choices cannot be wasted on the same language.
function getOzonianLanguageOptions() {
  const lg = LINEAGES.find(l => l.name === 'Ozonian');
  const taken = new Set([
    ...(lg?.langs?.speak || []).filter(l => l !== PLAYER_CHOICE_LANG),
    ...(ch.extraLanguagePicks || []).filter(Boolean),
  ]);
  // Never hide the current selection, or the dropdown would disagree with state.
  taken.delete(ch.ozonianLanguage);
  return TRADITIONAL_LANGUAGES.filter(l => !taken.has(l));
}

function setOzonianLanguage(lang) {
  ch.ozonianLanguage = lang || null;
  renderLineageDetail();
}

function setExtraLanguagePick(idx, lang, pool) {
  ch.extraLanguagePicks[idx] = lang;
  // Auto-set read if option grants it
  const opt = EXTRA_LANGUAGE_OPTIONS.find(o => o.name === ch.extraLanguage);
  if (opt?.picks?.read && opt.picks.read > 0 && idx < opt.picks.read) {
    ch.extraLanguageReads[idx] = getReadScript(lang);
  }
  renderLifepath();
}


function setLifepathCustom(key, value, rerender = false) {
  const text = String(value || '');
  const hasCustom = text.trim().length > 0;
  ch.lifepathCustom[key] = hasCustom ? text : '';

  if (hasCustom) {
    ch.lifepath[key] = null;
    document.querySelectorAll(`[data-lifepath-row="${key}"]`).forEach(row => row.classList.remove('lp-selected'));
    const badge = document.querySelector(`[data-lifepath-badge="${key}"]`);
    if (badge) {
      badge.className = 'lp-selected-badge';
      badge.textContent = '✓ Custom';
    }
  } else {
    const badge = document.querySelector(`[data-lifepath-badge="${key}"]`);
    if (badge) {
      badge.className = ch.lifepath[key] ? 'lp-selected-badge' : '';
      badge.textContent = ch.lifepath[key] ? `✓ ${ch.lifepath[key]}` : '';
    }
  }

  if (typeof saveLocal === 'function') saveLocal();
  if (rerender) renderLifepath();
}

function selectLifepath(key, value) {
  // Table choices and custom answers are mutually exclusive.
  const wasSelected = ch.lifepath[key] === value && !(ch.lifepathCustom[key] || '').trim();
  ch.lifepathCustom[key] = '';
  ch.lifepath[key] = wasSelected ? null : value;
  if (typeof saveLocal === 'function') saveLocal();
  renderLifepath();
}

// ═══════════════════════════════════════════════════════════════
// STEP 7 - STATUS POINTS
// ═══════════════════════════════════════════════════════════════

function renderStatusPoints() {
  const hp = calcHP(), mp = calcMP(), sp = calcSP();
  const totalCheck = hp + mp;
  const berserkerHP = ch.specialty === 'Berserker' ? 8 : 0;
  const hpFormulaExtra = berserkerHP ? ` + ${berserkerHP} (Berserker)` : '';
  document.getElementById('hp-formula').innerHTML =
    `<strong>HP</strong> = (STR ${getEffectiveAttr('STR')} + AGI ${getEffectiveAttr('AGI')}) × 2 + 4${hpFormulaExtra} = <strong>${hp}</strong> &nbsp;|&nbsp; ` +
    `<strong>MP</strong> = (WIT ${getEffectiveAttr('WIT')} + EMP ${getEffectiveAttr('EMP')}) × 2 + 4 = <strong>${mp}</strong> &nbsp;|&nbsp; ` +
    `<strong>Sorce Points</strong> = max MP = <strong>${sp}</strong>`;

  // Compute DP from armor selected in Step 6
  extractNumericDP();  // ensure ch.dp is current
  const dpVal = ch.dp || 0;
  const dpFormula = (() => {
    const gearVals = Object.values(ch.gearSelections || {});
    const ARMOR_NAMES_CHECK = ['quilted vest','layered plate','light leather','reinforced tunic','brigandine'];
    const armor = gearVals.find(v => ARMOR_NAMES_CHECK.some(a => v.toLowerCase().includes(a)));
    const shell = isPrideaHardenedShell();
    const guardian = ch.specialty === 'Guardian';
    const shellNote = shell ? ' + 5 (Hardened Carapace)' : '';
    const guardianNote = guardian ? ' + 5 (Guardian)' : '';
    const bonusNote = shellNote + guardianNote;
    if (!armor) return ch.specialty ? 'Choose armor in Step 6' : 'Set by armor';
    if (armor.toLowerCase().includes('light leather')) return `Light Leather = AGI(${getEffectiveAttr('AGI')})×3${bonusNote}`;
    const bonusTotal = (shell ? 5 : 0) + (guardian ? 5 : 0);
    const baseDP = dpVal - bonusTotal;
    return armor + ' = ' + baseDP + ' DP' + bonusNote;
  })();

  document.getElementById('status-grid').innerHTML = `
    <div class="status-card hp">
      <div class="status-name">Max HP</div>
      <div class="status-val">${hp}</div>
      <div class="status-formula">(STR+AGI)×2+4${ch.specialty==='Berserker'?'+8 (Berserker)':''}</div>
    </div>
    <div class="status-card mp">
      <div class="status-name">Max MP</div>
      <div class="status-val">${mp}</div>
      <div class="status-formula">(WIT+EMP)×2+4</div>
    </div>
    <div class="status-card dp">
      <div class="status-name">Max DP</div>
      <div class="status-val">${dpVal}</div>
      <div class="status-formula">${dpFormula}</div>
    </div>
    <div class="status-card sp">
      <div class="status-name">Sorce Points</div>
      <div class="status-val">${sp}</div>
      <div class="status-formula">= Max MP</div>
    </div>
    <div class="status-card" style="border-color:#b0aa9a">
      <div class="status-name">Recovery Dice</div>
      <div class="status-val">${getLevel()}</div>
      <div class="status-formula">= Level</div>
    </div>
  `;

  const checkEl = document.getElementById('status-check');
  const luStatusBonus = luSum('hp') + luSum('mp') + 2 * totalLuAttrPoints() + generalHPBonus() + generalMPBonus();
  const expectedTotal = (ch.specialty === 'Berserker' ? 32 : 24) + luStatusBonus;
  const berserkerCheckNote = ch.specialty === 'Berserker' ? ' (includes +8 from Berserker Thicker Skin)' : '';
  if (totalCheck === expectedTotal) {
    checkEl.className = 'info-box';
    checkEl.textContent = `✓ HP (${hp}) + MP (${mp}) = ${totalCheck} - Correct!${berserkerCheckNote}`;
  } else {
    checkEl.className = 'warn-box';
    checkEl.textContent = `⚠ HP (${hp}) + MP (${mp}) = ${totalCheck}. At Level ${getLevel()} this should equal ${expectedTotal}${berserkerCheckNote}. Check your Attribute assignments.`;
  }
}

// ═══════════════════════════════════════════════════════════════
// STEP 8 - TALENTS
// ═══════════════════════════════════════════════════════════════
function getAvailableTalents() {
  const cls = CLASSES.find(c=>c.name===ch.cls);
  if (!cls) return [];
  const isMartial  = cls.name==='Fighter' || cls.name==='Vagabond';
  const isSorcery  = cls.name==='Magi'    || cls.name==='Druid';
  const pool = [...GENERAL_TALENTS];
  if (isMartial) pool.push(...MARTIAL_TALENTS);
  if (isSorcery) pool.push(...SORCERY_TALENTS);
  return pool.sort();
}

function renderTalentStep() {
  // Always update ch state even if DOM elements aren't present
  if (ch.specialty) {
    // Don't overwrite Warlock's dynamic Patron's Gift text if a Study was already chosen
    const hasWarlockStudy = ch.specialty === 'Warlock' && (ch.talents||[]).some(t => WARLOCK_STUDIES.includes(t));
    if (!hasWarlockStudy) {
      ch.specialtyTalent = SPECIALTY_TALENT_TEXT[ch.specialty] || (ch.specialty + ' Specialty Talent');
    }
  }
  if (ch.lineage) {
    updateLineageBenefits();
  }
  const specEl = document.getElementById('talent-specialty');
  const lgEl   = document.getElementById('talent-lineage');
  const autoEl = document.getElementById('auto-talents');
  const browserEl = document.getElementById('talent-browser');
  // Guard: if key DOM elements aren't present, ch state is still updated above
  if (!specEl || !autoEl || !browserEl) return;
  if (specEl) { specEl.value = ch.specialtyTalent + ' (Rank 1)'; autoGrowTA(specEl); }
  if (lgEl)   { lgEl.value = ch.lineageBenefits || ''; autoGrowTA(lgEl); }

  const cls = CLASSES.find(c=>c.name===ch.cls);
  const isMartial  = cls && (cls.name==='Fighter'||cls.name==='Vagabond');
  const isSorcery  = cls && (cls.name==='Magi'||cls.name==='Druid');

  autoEl.innerHTML = `
    <div class="info-box">
      <strong>Auto-granted from ${ch.cls||'your Class'}:</strong> Access to ${cls?cls.talents:'-'}.
      ${isSorcery ? `Spellcasting Attribute: ${cls.spellcasting}.` : ''}
    </div>
    <div class="info-box" style="margin-top:8px">
      At Level 1 you may select:
      ${isMartial ? '<br>• <strong>1 Martial Talent</strong> (choose from the list below) at <strong>Rank 1</strong>.' : ''}
      ${isSorcery ? '<br>• <strong>1 Sorcery Talent</strong> (choose from the list below) at <strong>Rank 1</strong>.' : ''}
    </div>`;
  if (isSorcery) {
    autoEl.innerHTML += '<div class="info-box" style="margin-top:8px">Want to know the details of spells in each Study of Sorcery? <a href="https://spellbook.realmsoflegacy.com/" target="_blank" rel="noopener" style="color:var(--cyan);font-weight:700;text-decoration:underline">View the Spellbook here</a>.</div>';
  }

  // Count how many of each type already chosen
  const pickedMartial = (ch.talents||[]).filter(t => MARTIAL_TALENTS.includes(t)).length;
  const pickedSorcery = (ch.talents||[]).filter(t => SORCERY_TALENTS.includes(t)).length;
  const MAX_MARTIAL = 1; const MAX_SORCERY = 1;

  const sections = [];
  if (isMartial) sections.push({label:`Martial Talents - choose 1`,list:MARTIAL_TALENTS,type:'martial',picked:pickedMartial,max:MAX_MARTIAL});
  const sorceryList = (ch.specialty === 'Warlock') ? WARLOCK_STUDIES : SORCERY_TALENTS;
  if (isSorcery) sections.push({label:`${ch.specialty === 'Warlock' ? 'Patron Study (choose 1 - becomes Patron\'s Gift)' : 'Sorcery Talents - choose 1'}`,list:sorceryList,type:'sorcery',picked:pickedSorcery,max:MAX_SORCERY});

  browserEl.innerHTML = sections.map(sec => {
    const atMax = sec.picked >= sec.max;
    return `<div style="margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <h3 style="font-family:var(--font-ui);font-size:.9rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted)">${sec.label}</h3>
        <span style="font-family:var(--font-ui);font-size:.8rem;font-weight:700;color:${sec.picked>=sec.max?'var(--void)':'var(--cyan)'};background:${sec.picked>=sec.max?'var(--safe)':'rgba(79,195,247,0.18)'};border:1px solid ${sec.picked>=sec.max?'transparent':'rgba(79,195,247,0.4)'};padding:2px 8px;border-radius:12px">${sec.picked}/${sec.max}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:7px">
        ${sec.list.map(t => {
          const picked = (ch.talents||[]).includes(t);
          const isViewing = ch._viewingTalent === t;
          return `<button onclick="toggleTalentView('${t.replace(/'/g, "\\'")}')"
            style="padding:5px 12px;font-family:var(--font-ui);font-size:.82rem;font-weight:600;cursor:pointer;border-radius:20px;transition:all .12s;border:1px solid ${picked?'rgba(74,222,128,0.5)':isViewing?'rgba(79,195,247,0.5)':'var(--border)'};background:${picked?'rgba(74,222,128,0.12)':isViewing?'rgba(79,195,247,0.12)':'var(--surface)'};color:${picked?'var(--safe)':isViewing?'var(--cyan)':'var(--text)'}">
            ${t}${picked?' ✓':''}
          </button>`;
        }).join('')}
      </div>
      ${(ch.talents||[]).includes(sec.list.find(t=>ch._viewingTalent===t)||'__none__') || ch._viewingTalent && sec.list.includes(ch._viewingTalent) ? `
        <div style="margin-top:12px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:14px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
            <div>
              <div style="font-family:var(--font-ui);font-weight:700;font-size:1rem;color:var(--gold-pale)">${ch._viewingTalent}</div>
              <div style="font-family:var(--font-ui);font-size:.78rem;color:var(--muted)">${MARTIAL_TALENTS.includes(ch._viewingTalent)?'Martial Talent':SORCERY_TALENTS.includes(ch._viewingTalent)?'Sorcery Talent':'General Talent'}</div>
            </div>
          </div>
          <div style="font-family:var(--font-ui);font-size:.85rem;color:#333;line-height:1.5">${getTalentDescription(ch._viewingTalent||'')}</div>
        </div>` : ''}
    </div>`;
  }).join('');

  renderTalentSlots();
}

function addTalent(name, btn) { addTalentFromView(name); }

function removeTalent(idx) {
  ch.talents[idx] = '';
  renderTalentStep();
}

function renderTalentSlots() {
  const container = document.getElementById('talent-slots');
  container.innerHTML = '';

  const filled = (ch.talents||[]).map((t,i)=>({t,i})).filter(x=>x.t);
  const empty  = (ch.talents||[]).map((t,i)=>({t,i})).filter(x=>!x.t);
  const all    = [...filled, ...empty.slice(0, 9-filled.length)];

  all.slice(0,1).forEach(({t,i}) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:7px';
    row.innerHTML = `
      <span style="font-family:var(--font-ui);font-size:.78rem;font-weight:700;
                   color:var(--muted);min-width:20px;text-align:right">${i+1}</span>
      <input type="text" value="${t||''}"
             style="flex:1;padding:8px 10px;border:1px solid var(--rule);border-radius:6px;
                    font-family:var(--font-ui);font-size:.88rem"
             placeholder="Type or click a talent above..."
             onchange="ch.talents[${i}]=this.value;renderTalentStep()">
      ${t ? `<button onclick="removeTalent(${i})"
               style="padding:5px 10px;background:#fee2e2;border:1px solid #fca5a5;
                      border-radius:6px;cursor:pointer;font-size:.8rem;color:var(--danger);
                      font-family:var(--font-ui);font-weight:600">✕</button>` : ''}
    `;
    container.appendChild(row);
  });
}

// ═══════════════════════════════════════════════════════════════
// STEP 9 - DETAILS
// ═══════════════════════════════════════════════════════════════
function renderDetailsStep() {
  const notableSlots = document.getElementById('notable-slots');
  if (!notableSlots) return; // not in DOM yet

  // Notable characters
  notableSlots.innerHTML = `
    <div class="form-row cols2">
      ${Array(10).fill(0).map((_,i) => `
        <div>
          <label class="field-label">Character ${i+1}</label>
          <input type="text" value="${ch.notable[i]||''}"
                 onchange="ch.notable[${i}]=this.value"
                 placeholder="Name / relationship...">
        </div>
      `).join('')}
    </div>
  `;
  // Restore notes textarea
  const notesEl = document.getElementById('char-notes');
  if (notesEl && ch.notes) notesEl.value = ch.notes;
}


function getEffectiveLineageName() {
  return ch.mixedLineage
    ? (ch.mixedAssignment.features || ch.mixedLineages[0] || null)
    : ch.lineage;
}

function getDisplayLineageName() {
  return ch.mixedLineage && ch.mixedLineages.length === 2
    ? ch.mixedLineages.join(' / ')
    : (ch.lineage || '-');
}

function getLifepathAnswer(key) {
  const custom = (ch.lifepathCustom?.[key] || '').trim();
  return custom || ch.lifepath?.[key] || '';
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ═══════════════════════════════════════════════════════════════
// STEP 10 - SUMMARY
// ═══════════════════════════════════════════════════════════════
function renderSummary() {
  const allSkills = {};
  for (const skills of Object.values(SKILLS)) skills.forEach(s => { allSkills[s.key] = getSkillRank(s.key); });
  const effectiveLineageName = getEffectiveLineageName();
  const lg = LINEAGES.find(l=>l.name===effectiveLineageName);

  const grid = document.getElementById('summary-grid');
  grid.innerHTML = `
    <div class="summary-block">
      <h3>Identity</h3>
      <div class="summary-row"><span class="s-label">Name</span><span class="s-val">${esc(ch.name||'-')}</span></div>
      <div class="summary-row"><span class="s-label">Level</span><span class="s-val">${getLevel()}</span></div>
      <div class="summary-row"><span class="s-label">Class</span><span class="s-val">${esc(ch.cls||'-')}</span></div>
      <div class="summary-row"><span class="s-label">Specialty</span><span class="s-val">${esc(ch.specialty||'-')}</span></div>
      <div class="summary-row"><span class="s-label">Lineage</span><span class="s-val">${esc(getDisplayLineageName())}</span></div>
      <div class="summary-row"><span class="s-label">Size</span><span class="s-val">${lg ? (ch.mixedForcedSmall ? 'Small' : ((ch.sizeChoice && (lg.size === 'Varies' || isVariableSizeLineage(lg.name))) ? ch.sizeChoice : lg.size)) : '-'}${ch.mixedForcedSmall ? ' (Small and Nimble)' : ''}</span></div>
      <div class="summary-row"><span class="s-label">Speed</span><span class="s-val">${lg?(() => { const s = lg.speed+(ch.specialty==='Elemancer'?5:0); const dk = ch.lineage==='Darkaen'||(ch.mixedLineage&&ch.mixedLineages.includes('Darkaen')); return s + (dk ? '; Fly '+Math.floor(s/2) : ''); })():'-'}${ch.specialty==='Elemancer'?' (includes +5 Elemancer)':''}</span></div>
    </div>
    <div class="summary-block">
      <h3>Attributes</h3>
      ${ATTRIBUTES.map(a=>`
        <div class="summary-row"><span class="s-label">${a.name}</span><span class="s-val">${getEffectiveAttr(a.key)}</span></div>
      `).join('')}
    </div>
    <div class="summary-block">
      <h3>Status Points</h3>
      <div class="summary-row"><span class="s-label">Max HP</span><span class="s-val" style="color:var(--danger)">${calcHP()}</span></div>
      <div class="summary-row"><span class="s-label">Max MP</span><span class="s-val" style="color:#1565c0">${calcMP()}</span></div>
      <div class="summary-row"><span class="s-label">Sorce Points</span><span class="s-val" style="color:#6a1b9a">${calcSP()}</span></div>
      <div class="summary-row"><span class="s-label">Recovery Dice</span><span class="s-val">${getLevel()}</span></div>
    </div>
    <div class="summary-block">
      <h3>Lifepath</h3>
      <div class="summary-row"><span class="s-label">Upbringing</span><span class="s-val">${esc(getLifepathAnswer('upbringing')||'-')}</span></div>
      <div class="summary-row"><span class="s-label">Culture</span><span class="s-val">${esc(getLifepathAnswer('culture')||'-')}</span></div>
      <div class="summary-row"><span class="s-label">Personality</span><span class="s-val">${esc(getLifepathAnswer('personality')||'-')}</span></div>
      <div class="summary-row"><span class="s-label">Values</span><span class="s-val">${esc(getLifepathAnswer('value')||'-')}</span></div>
    </div>
    <div class="summary-block" style="grid-column:1/-1">
      <h3>Skills</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0">
        ${['STR','AGI','WIT','EMP'].map(attrKey => {
          const attr = ATTRIBUTES.find(a=>a.key===attrKey);
          const attrSkills = SKILLS[attrKey] || [];
          return '<div style="padding:0 8px 0 0">'
            + '<div style="font-family:var(--font-ui);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);padding:6px 8px 4px;border-bottom:1px solid var(--rule);margin-bottom:4px">'
            + attr.name + '</div>'
            + attrSkills.map(skill => {
                const rank = allSkills[skill.key] || 0;
                const hasRank = rank > 0;
                return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;border-radius:5px;margin-bottom:2px;background:' + (hasRank?'var(--accent-lt)':'transparent') + '">'
                  + '<span style="font-family:var(--font-ui);font-size:.88rem;color:' + (hasRank?'var(--accent-dk)':'var(--muted)') + ';font-weight:' + (hasRank?'600':'400') + '">' + skill.name + '</span>'
                  + (hasRank ? '<span style="font-family:var(--font-ui);font-size:.75rem;font-weight:700;color:var(--accent);background:var(--card-bg);border:1px solid var(--cyan);border-radius:4px;padding:1px 6px">Rank ' + rank + '</span>' : '<span style="font-family:var(--font-ui);font-size:.75rem;color:#ccc">—</span>')
                  + '</div>';
              }).join('')
            + '</div>';
        }).join('')}
      </div>
    </div>
  `;

  // Validation
  const checks = [];
  const attrSum = getEffectiveAttrSum();
  const expectedAttrSum = 8 + totalLuAttrPoints();
  checks.push({ok: attrSum === expectedAttrSum, msg: `Attribute sum = ${attrSum} (should be ${expectedAttrSum})`});
  const expectedSumCheck = (ch.specialty === 'Berserker' ? 32 : 24) + luSum('hp') + luSum('mp') + 2 * totalLuAttrPoints() + generalHPBonus() + generalMPBonus();
  checks.push({ok: calcHP()+calcMP() === expectedSumCheck, msg: `HP+MP = ${calcHP()+calcMP()} (should be ${expectedSumCheck} at level ${getLevel()}${ch.specialty === 'Berserker' ? ', includes +8 Berserker' : ''})`});
  // A character levelled up before the Attribute cap was enforced across a single
  // level-up's choices can be carrying an over-cap Attribute.
  const overCap = ATTRIBUTES.filter(a => getEffectiveAttr(a.key) > ATTR_RANK_MAX);
  checks.push({ok: overCap.length === 0, msg: overCap.length
    ? `${overCap.map(a => a.name + ' = ' + getEffectiveAttr(a.key)).join(', ')} — above the Rank ${ATTR_RANK_MAX} cap; revisit those level-ups`
    : `All Attributes within the Rank ${ATTR_RANK_MAX} cap`});
  // A character saved before the Ozonian language picker existed can reach this
  // step with no choice made, which would export the placeholder text.
  if (getEffectiveLineageName() === 'Ozonian') {
    checks.push({ok: !!ch.ozonianLanguage, msg: ch.ozonianLanguage
      ? `Ozonian language = ${ch.ozonianLanguage} (reads ${getReadScript(ch.ozonianLanguage)})`
      : 'Ozonian traditional language not chosen — pick one in Step 3'});
  }

  document.getElementById('export-validation').innerHTML = checks.map(c => `
    <div class="${c.ok?'validation-msg ok':'validation-msg error'}">${c.ok?'✓':'✗'} ${c.msg}</div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════════════════════════════

// ── Weapon data for attack section auto-fill ──────────────────────────
const WEAPON_DATA = {
  'Short Sword':      {range:'5 ft.', mod:'+1', damage:'6 Slash',  attr:'STR_AGI_HIGH', skill:'Brawl', features:'Balanced'},
  'Shortsword':       {range:'5 ft.', mod:'+1', damage:'6 Slash',  attr:'STR_AGI_HIGH', skill:'Brawl', features:'Balanced'},
  'Hand Axe':         {range:'5 ft.', mod:'+1', damage:'4 Slash',  attr:'STR_AGI_HIGH', skill:'Brawl', features:'Balanced, Throwing, Savage'},
  'Hammer':           {range:'5 ft.', mod:'+1', damage:'4 Blunt',  attr:'STR_AGI_HIGH', skill:'Brawl', features:'Balanced, Throwing, Penetrate'},
  'Mace':             {range:'5 ft.', mod:'0',  damage:'6 Blunt',  attr:'STR',          skill:'Brawl', features:'Versatile, Penetrate'},
  'Long Sword':       {range:'5 ft.', mod:'0',  damage:'8 Slash',  attr:'STR',          skill:'Brawl', features:'Versatile'},
  'Longsword':        {range:'5 ft.', mod:'0',  damage:'8 Slash',  attr:'STR',          skill:'Brawl', features:'Versatile'},
  'Battle Axe':       {range:'5 ft.', mod:'0',  damage:'6 Slash',  attr:'STR',          skill:'Brawl', features:'Versatile, Savage'},
  'Limb Wraps':       {name:'Unarmed Strike', range:'5 ft.', mod:'0', damage:'6 Blunt', attr:'STR_AGI_HIGH', skill:'Brawl', features:'none'},
  'Arcane Staff':     {range:'5 ft.', mod:'0',  damage:'6 Blunt',  attr:'STR_AGI_HIGH', skill:'Brawl', features:'Balanced, Versatile'},
  'Dagger':           {range:'5 ft.', mod:'+1', damage:'4 Pierce', attr:'STR_AGI_HIGH', skill:'Brawl', features:'Balanced, Throwing, Dueling'},
  'Crossbow':         {range:'80 ft.', mod:'0', damage:'6 Pierce', attr:'AGI',          skill:'Shoot', features:'Slow Load, Heavy, Savage, Ammo (Bolt Pouch)'},
  'Shortbow':         {range:'40 ft.', mod:'+1', damage:'6 Pierce', attr:'AGI',         skill:'Shoot', features:'Heavy, Ammo (Arrow Quiver)'},
  'Shortbow and Arrow Quiver': {name:'Shortbow', range:'40 ft.', mod:'+1', damage:'6 Pierce', attr:'AGI', skill:'Shoot', features:'Heavy, Ammo (Arrow Quiver)'},
  'Flintlock Pistol': {range:'40 ft.', mod:'+1', damage:'4 Pierce', attr:'AGI',         skill:'Shoot', features:'Slow Load, Penetrate, Ammo (Bullet Pouch)'},
  'Flintlock pistol': {range:'40 ft.', mod:'+1', damage:'4 Pierce', attr:'AGI',         skill:'Shoot', features:'Slow Load, Penetrate, Ammo (Bullet Pouch)'},
};

// Build dice pool string from attribute rank + skill rank + mod
function buildDicePool(attrKey, skillKey, modStr) {
  let attrVal = 0;
  if (attrKey === 'STR_AGI_HIGH') {
    const s = getEffectiveAttr('STR'), a = getEffectiveAttr('AGI');
    attrVal = (s >= a) ? s : a;
  } else if (attrKey === 'STR') {
    attrVal = getEffectiveAttr('STR');
  } else if (attrKey === 'AGI') {
    attrVal = getEffectiveAttr('AGI');
  }
  const skillVal = getSkillRank(skillKey);

  let d8s = 0, d6s = 0;
  if (attrVal === 0 && skillVal === 0) {
    d6s = 1;
  } else {
    const high = Math.max(attrVal, skillVal);
    const low  = Math.min(attrVal, skillVal);
    d8s = low;
    d6s = high - low;
  }

  // +1 mod adds 1d6
  if (modStr === '+1') d6s += 1;

  let parts = [];
  if (d8s > 0) parts.push(d8s + 'd8');
  if (d6s > 0) parts.push(d6s + 'd6');
  return parts.length ? parts.join('+') : '1d6';
}

// Get weapon name displayed in attack fields
function getWeaponName(item) {
  const w = WEAPON_DATA[item];
  if (!w) return null;
  return w.name || item;
}



// ── Spell data by Study ──────────────────────────────────────────────
// Each spell: {name, study, pl (power level or '-'), range, ct (casting time), shape, dur, focus (bool)}
function compactLineageBenefitsForPdf(text) {
  let out = String(text || '');
  // Save space in the PDF field without changing the actual rule text.
  // Remove source/type labels such as "(Major Trait from Humans)" and "(Minor Trait)".
  out = out.replace(/^\s*[^:\n]+ Lineage:\s*\n?/i, '');
  out = out.replace(/\s*\((?:Major|Minor) Trait(?: from [^)]+)?\)/gi, '');
  out = out.replace(/\s*\(from [^)]+\)/gi, '');
  out = out.replace(/\n{2,}/g, '\n');
  out = out.replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n');
  return out.trim();
}

async function exportPDF() {
  const btn = document.getElementById('export-btn');
  btn.disabled = true;
  btn.textContent = 'Generating PDF...';
  try {
    // Refresh lineage benefits before export to ensure bloodline/purpose text is current
    updateLineageBenefits();
    // Fetch the PDF template
    const response = await fetch('./Character_Sheet_Form_Fill.pdf');
    if (!response.ok) {
      throw new Error(`Could not load Character_Sheet_Form_Fill.pdf (${response.status}). Check the filename, case, and repo path.`);
    }
    const pdfBytes = await response.arrayBuffer();
    const { PDFDocument } = PDFLib;
    const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = pdf.getForm();

    // For mixed lineage, pull stats from the Features lineage
    const featuresLineageName = getEffectiveLineageName();
    const lg = LINEAGES.find(l=>l.name===featuresLineageName) || {};
    const allSkills = {};
    for (const skills of Object.values(SKILLS)) skills.forEach(s => { allSkills[s.key] = getSkillRank(s.key); });

    // Helper — sanitize to WinAnsi-safe ASCII
    const winansi = s => String(s||'').replace(/[\u0080-\uffff]/g, c => {
      const map = {'\u2264':'<=','\u2265':'>=','\u2014':'-','\u2013':'-','\u2500':'-',
                   '\u2019':"'",'\u2018':"'",'\u201c':'"','\u201d':'"','\u2026':'...',
                   '\u00e9':'e','\u00e8':'e','\u00e0':'a','\u00e2':'a','\u00ea':'e',
                   '\u00ee':'i','\u00f4':'o','\u00fb':'u','\u00fc':'u','\u00e7':'c'};
      return map[c] || '';
    });
    const set = (fieldName, val) => {
      try { form.getTextField(fieldName).setText(winansi(val)); } catch(e) {}
    };
    const setCheck = (fieldName, checked) => {
      try {
        const f = form.getCheckBox(fieldName);
        if (checked) f.check(); else f.uncheck();
      } catch(e) {
        try {
          const f = form.getButton(fieldName);
          f.setImage && f.setImage('');
        } catch(e2) {}
      }
    };

    // Page 1 - Identity
    set('Character Name', ch.name);
    set('JOB', ch.cls);
    // Spellcasting attribute: Wits for Magi, Empathy for Druid
    const clsData = CLASSES.find(c => c.name === ch.cls);
    if (clsData?.spellcasting) {
      set('spell att', clsData.spellcasting);
    } else if (getSpellcastingAttrKey()) {
      set('spell att', getSpellcastingAttrKey() === 'WIT' ? 'Wits' : 'Empathy');
    }
    set('SPECIALTY', ch.specialty);
    // Lineage name — show both if Mixed
    const lineagePDFName = ch.mixedLineage && ch.mixedLineages.length === 2
      ? ch.mixedLineages.join('/')
      : (ch.lineage || '');
    set('LINEAGE', lineagePDFName);
    set('LEVEL', getLevel());
    set('XP', 0);
    // If mixed lineage with Fueglin Small and Nimble, force Small
    // Undead: size comes from the Repurposed lineage (not Undead's own 'Varies')
    let effectiveSize = lg.size || '';
    if (ch.mixedForcedSmall) {
      effectiveSize = 'Small';
    } else if (featuresLineageName === 'Undead' && ch.undeadRepurposedLineage) {
      const repLgSize = LINEAGES.find(l => l.name === ch.undeadRepurposedLineage);
      const repSize = repLgSize?.size || '';
      // Human/Ozonian use sizeChoice; others use their defined size
      effectiveSize = (ch.undeadRepurposedLineage === 'Humans' || ch.undeadRepurposedLineage === 'Ozonian')
        ? (ch.sizeChoice || repSize)
        : repSize;
    } else if (ch.sizeChoice && (featuresLineageName === 'Humans' || featuresLineageName === 'Ozonian')) {
      effectiveSize = ch.sizeChoice;
    }
    set('SIZE', effectiveSize);
    const baseLangs      = getLineageLangs(lg);
    const baseSpeakLangs = baseLangs.speak;
    const baseReadLangs  = baseLangs.read;
    const extraSpeak = ch.extraLanguagePicks?.filter(l=>l) || [];
    const extraRead  = ch.extraLanguageReads?.filter(l=>l) || [];
    // Fixed extras (ESL, Beasts)
    const opt = ch.extraLanguage ? EXTRA_LANGUAGE_OPTIONS.find(o=>o.name===ch.extraLanguage) : null;
    const fixedSpeak = opt?.fixed?.speak || [];
    const allSpeak   = [...new Set([...baseSpeakLangs, ...extraSpeak, ...fixedSpeak])];
    const allRead    = [...new Set([...baseReadLangs,  ...extraRead])];
    set('LANGUAGES',      allSpeak.join(', '));
    set('LANGUAGES read', allRead.join(', '));
    const elemancerSpeed = ch.specialty === 'Elemancer' ? 5 : 0;
    const mobileRank = getCharacterTalents().get('Mobile') || 0;
    const mobileSpeed = [0, 5, 10, 20][mobileRank] || 0;
    const baseSpeed = (lg.speed || 30) + elemancerSpeed + mobileSpeed;
    const isDarkaen = ch.lineage === 'Darkaen' || (ch.mixedLineage && ch.mixedLineages.includes('Darkaen'));
    const flySpeed = isDarkaen ? '; Fly ' + Math.floor(15) : '';
    set('SPEED', baseSpeed + flySpeed);

    // Attributes
    set('STRENGTH',  getEffectiveAttr('STR'));
    set('AGILITY',   getEffectiveAttr('AGI'));
    set('WITS',      getEffectiveAttr('WIT'));
    set('EMPATHY',   getEffectiveAttr('EMP'));

    // Skills
    set('Brawl',      allSkills.Brawl||0);
    set('Endure',     allSkills.Endure||0);
    set('Intimidate', allSkills.Intimidate||0);
    set('Might',      allSkills.Might||0);
    set('Finesse',    allSkills.Finesse||0);
    set('Hide',       allSkills.Hide||0);
    set('Move',       allSkills.Move||0);
    set('Shoot',      allSkills.Shoot||0);
    set('Analyze',    allSkills.Analyze||0);
    set('Insight',    allSkills.Insight||0);
    set('Scout',      allSkills.Scout||0);
    set('Survival',   allSkills.Survival||0);
    set('Medical',    allSkills.Medical||0);
    set('Manipulate', allSkills.Manipulate||0);
    set('Perform',    allSkills.Perform||0);
    set('Tame',       allSkills.Tame||0);

    // Talents (page 1 table) — with current ranks
    const talentRankMap = getCharacterTalents();
    const allTalents = [ch.specialty, ...talentRankMap.keys()];
    const rankOf = t => t === ch.specialty ? specialtyRankAtLevel(getLevel()) : (talentRankMap.get(t) || 1);
    allTalents.slice(0,10).forEach((t,i)=>{ set(`MP Talent name ${i+1}`, t); set(`MP Talent rank ${i+1}`, String(rankOf(t))); });

    // Status points
    set('HP max', calcHP());  set('HP cur', calcHP());
    set('MP max', calcMP());  set('MP Cur', calcMP());
    const dpVal = ch.dp || 0;
    set('DP max', dpVal);     set('DP Cur', dpVal);
    set('Sorce Max', calcSP()); set('Sorce Cur', calcSP());
    set('Recovery Max', getLevel()); set('Recovery Cur', getLevel());
    set('Specialty max', 0); set('Specialty Cur', 0);

    // CHARACTER NOTES filled below after setSmall is declared

    // Weapons — auto-fill from gear selections
    const gearValsForWeapons = Object.values(ch.gearSelections || {}).filter(v => v);
    const weaponEntries = [];
    const seenWeaponNames = new Set();
    gearValsForWeapons.forEach(item => {
      // Case-insensitive lookup: try exact, then title-case, then by lowercased key match
      const wExact = WEAPON_DATA[item];
      const wTitle = WEAPON_DATA[item.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')];
      const wLower = Object.keys(WEAPON_DATA).find(k => k.toLowerCase() === item.toLowerCase());
      // Final fallback: ignore spaces too, so gear strings like 'Short bow'
      // match the WEAPON_DATA key 'Shortbow'. Without this, Sharpshooter's
      // default weapon produced no attack row in the PDF.
      const norm = s => s.toLowerCase().replace(/\s+/g,'');
      const wNoSpace = Object.keys(WEAPON_DATA).find(k => norm(k) === norm(item));
      const w = wExact || wTitle || (wLower ? WEAPON_DATA[wLower] : null) || (wNoSpace ? WEAPON_DATA[wNoSpace] : null);
        if (w) {
        const entryName = w.name || item;
        // Deduplicate: skip if already added (e.g. two Daggers from Sonneteer)
        if (seenWeaponNames.has(entryName.toLowerCase())) return;
        seenWeaponNames.add(entryName.toLowerCase());
        // Sharpshooter Eagle Eye: +20 ft to ranged weapon max range
        let weaponRange = w.range;
        if (ch.specialty === 'Sharpshooter' && w.skill === 'Shoot') {
          const rangeMatch = weaponRange.match(/^(\d+)/);
          if (rangeMatch) {
            weaponRange = (parseInt(rangeMatch[1]) + 20) + weaponRange.slice(rangeMatch[1].length);
          }
        }
        weaponEntries.push({
          name:     entryName,
          range:    weaponRange,
          mod:      w.mod,
          damage:   w.damage,
          pool:     buildDicePool(w.attr, w.skill, w.mod),
          features: w.features,
        });
      }
    });
    weaponEntries.slice(0, 5).forEach((w, i) => {
      const n = i + 1;
      set('attack name '     + n, w.name);
      set('attack range '    + n, w.range);
      set('attack mod '      + n, w.mod);
      set('attack damage '   + n, w.damage);
      set('attack pool '     + n, w.pool);
      set('attack features ' + n, w.features);
    });

    // Currency
    set('Silver',  ch.currency?.silver||0);
    set('Gold',    ch.currency?.gold||0);
    set('Pluther', ch.currency?.pluther||0);

    // Equipment - smart slot assignment from gear selections
    // PDF fields: Equipment 1=Armor, 2=Back, 3=Back2, 4=Belt, 5=Belt2, 6=Kit
    const ARMOR_NAMES_PDF = ['quilted vest','layered plate','light leather','reinforced tunic','brigandine'];
    // Use gearSelections if populated, otherwise fall back to ch.equip
    const rawGearVals = Object.values(ch.gearSelections || {}).filter(v => v);
    const gearVals = rawGearVals.length > 0 ? rawGearVals : ch.equip.filter(v => v);
    const armorItem  = gearVals.find(v => ARMOR_NAMES_PDF.some(a => v.toLowerCase().includes(a))) || '';
    const nonBackpack = gearVals.filter(v => !ARMOR_NAMES_PDF.some(a => v.toLowerCase().includes(a)) && v.toLowerCase() !== 'backpack');
    const isWeaponItem = v => ['sword','bow','axe','mace','dagger','pistol','wand','staff',
      'crossbow','instrument','hammer','longsword','shortsword','flintlock'].some(w => v.toLowerCase().includes(w));
    const isKitItem = v => ['alchemy kit','engineer tool kit'].some(k => v.toLowerCase().includes(k));

    // Belt items by keyword
    const BELT_KEYWORDS = ['short sword','hand axe','hammer','long sword','battle axe',
      'flintlock pistol','bullet pouch','limb wraps','bolt pouch','dagger','arcane wand',
      'shortsword','pistol'];
    const BACK_KEYWORDS = ['small shield','mace','crossbow','short bow','shortbow',
      'arrow quiver','arcane staff','arcane instrument','longsword','longsword','staff'];

    const slotOf = v => {
      const lv = v.toLowerCase();
      if (BACK_KEYWORDS.some(k => lv.includes(k))) return 'back';
      if (BELT_KEYWORDS.some(k => lv.includes(k))) return 'belt';
      return 'belt'; // default to belt
    };

    const kitItem   = nonBackpack.find(isKitItem) || '';
    const gearItems = nonBackpack.filter(v => !isKitItem(v));

    // Special: if Summoner chose Shortbow, add Arrow Quiver
    const expandedGear = [];
    gearItems.forEach(v => {
      expandedGear.push(v);
      if (v.toLowerCase() === 'shortbow and arrow quiver') { expandedGear[expandedGear.length-1] = 'Shortbow'; expandedGear.push('Arrow Quiver'); }
    });

    const backItems = expandedGear.filter(v => slotOf(v) === 'back');
    const beltItems = expandedGear.filter(v => slotOf(v) === 'belt');

    // Fill Back (Equipment 2-3) and Belt (Equipment 4-5)
    // Overflow rules:
    //   - Belt overflow → Back slots (if space), else Backpack (Gear Name)
    //   - Back overflow → Backpack (Gear Name), NOT Belt
    const backSlots = backItems.slice(0, 2);
    const backOverflow = backItems.slice(2);       // back items that didn't fit → backpack

    const beltSlots = beltItems.slice(0, 2);
    let beltOverflow = beltItems.slice(2);          // belt items that didn't fit

    // Belt overflow can use remaining back slots
    const remainingBackSlots = 2 - backSlots.length;
    if (remainingBackSlots > 0 && beltOverflow.length > 0) {
      const promoted = beltOverflow.splice(0, remainingBackSlots);
      backSlots.push(...promoted);
    }
    // Any remaining belt overflow → backpack
    const backpackItems = [...backOverflow, ...beltOverflow];

    set('Equipment 1', armorItem);
    set('Equipment 2', backSlots[0]||'');
    set('Equipment 3', backSlots[1]||'');
    set('Equipment 4', beltSlots[0]||'');
    set('Equipment 5', beltSlots[1]||'');
    set('Equipment 6', kitItem);  // Kit slot

    // Overflow items → Gear Name slots (backpack inventory on page 2)
    backpackItems.slice(0, 16).forEach((item, i) => set('Gear Name ' + (i+1), item));

    // Page 2 - Lifepath
    set('Upbringing',               getLifepathAnswer('upbringing'));
    set('Culture',                  getLifepathAnswer('culture'));
    set('Personality',              getLifepathAnswer('personality'));
    set('Value Most',               getLifepathAnswer('value'));
    set('What Upsets You',          getLifepathAnswer('upset'));
    set('How you approach Decisions', getLifepathAnswer('decisions'));
    set('How you view others',      getLifepathAnswer('viewOfOthers'));

    // Notable characters
    ch.notable.slice(0,10).forEach((n,i)=> set(`Notable Char ${i+1}`, n));

    // Backpack slots (generic)
    const bpItems = ch.equip.slice(6)||[];
    bpItems.slice(0,16).forEach((item,i) => set(`Gear Name ${i+1}`, item||''));

    // Page 3 - Talents (small font size for compact display)
    // Strip HTML tags from a string (for plain text PDF fields)
    const stripHtml = s => String(s||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
    // Same as stripHtml but keeps line breaks (collapses only spaces/tabs).
    const stripHtmlNL = s => String(s||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').trim();

    const setSmall = (fieldName, val, size, keepNL) => {
      try {
        const field = form.getTextField(fieldName);
        const cleanVal = winansi(keepNL ? stripHtmlNL(val) : stripHtml(val));
        // For multiline fields setFontSize may fail - try both approaches
        try {
          field.setFontSize(size || 7);
        } catch(fe) {
          // Multiline field: patch the /DA (Default Appearance) stream directly
          try {
            const widgets = field.acroField.getWidgets();
            const daStr = '/Helvetica ' + (size||7) + ' Tf 0 g';
            widgets.forEach(w => {
              w.setDefaultAppearance(daStr);
            });
            field.acroField.setDefaultAppearance(daStr);
          } catch(da) {}
        }
        field.setText(cleanVal);
      } catch(e) {}
    };
    // Backpack fields (must come after setSmall is declared)
    setSmall('Back and kit features', 'Backpack', 14);
    setSmall('carry Cur', '8', 14);

    setSmall('LINEAGE BENEFITS', compactLineageBenefitsForPdf(ch.lineageBenefits||''), 8);

    // Sync notes from textarea and fill CHARACTER NOTES field
    const notesEl = document.getElementById('char-notes');
    if (notesEl && notesEl.value) ch.notes = notesEl.value;
    setSmall('CHARACTER NOTES', ch.notes||'', 9);

    // Fix oversized default font on blank player-fill fields
    // (Additional Notes, Curses and Diseases, Loot and Artifacts).
    // These are left empty, so text typed into the downloaded PDF uses the
    // field's default appearance, which is huge/auto-sized. Patch the /DA
    // to 9pt Helvetica so typed text matches Character Notes on page 1.
    const fixBlankFieldFontSize = (nameFragments, size) => {
      form.getFields().forEach(f => {
        const nm = (f.getName() || '').toLowerCase();
        if (!nameFragments.some(frag => nm.includes(frag))) return;
        try {
          const field = form.getTextField(f.getName());
          try { field.setFontSize(size); } catch(fe) {}
          // Always patch the default appearance directly as well — covers
          // multiline fields and auto-size (0 Tf) defaults that setFontSize misses.
          try {
            const daStr = '/Helvetica ' + size + ' Tf 0 g';
            field.acroField.getWidgets().forEach(w => w.setDefaultAppearance(daStr));
            field.acroField.setDefaultAppearance(daStr);
          } catch(da) {}
          // If the field already has text, re-set it so the visible
          // appearance stream regenerates at the new size.
          try { const cur = field.getText(); if (cur) field.setText(cur); } catch(te) {}
        } catch(e) {} // not a text field or missing — skip
      });
    };
    fixBlankFieldFontSize(
      ['additional notes', 'curses', 'diseases', 'loot', 'artifacts'],
      9
    );

    // Level 19/20 features → Additional Notes (page 2)
    const extraNotes = [];
    if (getLevel() >= 19) extraNotes.push(LEVEL19_RECOVERY_TEXT);
    if (getLevel() >= 20 && ch.reliableAttr) {
      const relName = (ATTRIBUTES.find(a => a.key === ch.reliableAttr) || {}).name || ch.reliableAttr;
      extraNotes.push('Reliable Attribute: ' + relName + '. ' + RELIABLE_ATTRIBUTE_TEXT);
    }
    if (extraNotes.length) {
      const notesField = form.getFields().map(f => f.getName()).find(n => (n || '').toLowerCase().includes('additional notes'));
      if (notesField) setSmall(notesField, extraNotes.join('\n\n'), 9);
    }

    // Spells — fill page 4 if a Study of Sorcery talent was selected
    const studyTalent = [...getCharacterTalents().keys()].find(t => t && t.startsWith('Study of'));
    if (studyTalent && STUDY_SPELLS[studyTalent]) {
      const study = STUDY_SPELLS[studyTalent];
      (study.rank0 || []).slice(0, 7).forEach((sp, i) => {
        const n = i + 1;
        set('r0sname' + n,     winansi(sp.name));
        set('r0sstudy' + n,    winansi(sp.study));
        set('r0srange' + n,    winansi(sp.range));
        set('r0sct' + n,       winansi(sp.ct));
        set('r0sshape' + n,    winansi(sp.shape));
        set('r0sduration' + n, winansi(sp.dur));
        setSmall('rank0spower' + n, sp.pl === '-' ? '' : sp.pl, 9);
        if (sp.focus) { try { form.getCheckBox('rk0f' + n).check(); } catch(e) {} }
      });
      (study.rank1 || []).slice(0, 7).forEach((sp, i) => {
        const n = i + 1;
        set('r1sname' + n,     winansi(sp.name));
        set('r1sstudy' + n,    winansi(sp.study));
        set('r1srange' + n,    winansi(sp.range));
        set('r1sct' + n,       winansi(sp.ct));
        set('r1sshape' + n,    winansi(sp.shape));
        set('r1sduration' + n, winansi(sp.dur));
        setSmall('rank1spower' + n, sp.pl === '-' ? '' : sp.pl, 9);
        if (sp.focus) { try { form.getCheckBox('rk1f' + n).check(); } catch(e) {} }
      });
    }
    // Specialty Talent: condensed summary of every unlocked rank
    const specRankPdf = specialtyRankAtLevel(getLevel());
    const specSummary = SPECIALTY_PDF_SUMMARY[ch.specialty];
    let pdfSpecialtyTalent;
    if (specSummary) {
      pdfSpecialtyTalent = ch.specialty + ' - Rank ' + specRankPdf + '\n'
        + specSummary.slice(0, specRankPdf).map((s, i) => 'Rank ' + (i + 1) + '\n' + String(s).replace(/\{rank3\}/g, specRankPdf * 3).replace(/\{rank2\}/g, specRankPdf * 2).replace(/\{rank\}/g, specRankPdf)).join('\n')
        + '\nFull details: Classes & Specialties chapter, Core Rulebook.';
      if (ch.specialty === 'Warlock') {
        const warlockStudy = (ch.talents || []).find(t => WARLOCK_STUDIES.includes(t));
        if (warlockStudy) pdfSpecialtyTalent = pdfSpecialtyTalent.replace('your chosen Study of Sorcery', warlockStudy);
      }
    } else {
      pdfSpecialtyTalent = '(Rank ' + specRankPdf + ') ' + (ch.specialtyTalent || '');
    }
    setSmall('SPECIALTY TALENT', pdfSpecialtyTalent, specRankPdf >= 4 ? 6 : specRankPdf >= 2 ? 8 : 10, true);
    const talentFields = ['TALENT','TALENT_2','TALENT_3','TALENT_4','TALENT_5','TALENT_6','TALENT_7','TALENT_8','TALENT_9'];
    const stripTags = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');
    // Full talent text for every unlocked rank (ranks stack, so include all up to current)
    const rankTexts = (t, r) => TALENT_DATA[t]
      ? TALENT_DATA[t].slice(0, r).map((txt, ri) => (r > 1 ? 'Rank ' + (ri + 1) + ': ' : '') + stripTags(txt)).join('\n')
      : '';
    // Caster Initiate: fold its granted Sorcery Talent into the same box
    const ciEntry = (ch.levelUps || []).find(l => l.talent && l.talent.kind === 'new' && l.talent.name === 'Caster Initiate');
    const ciBonus = ciEntry ? ciEntry.bonusTalent : null;
    const boxTalents = [...talentRankMap.keys()].filter(t => !(ciBonus && t === ciBonus));
    boxTalents.slice(0,9).forEach((t,i) => {
      let text, ranksShown;
      if (t === 'Caster Initiate' && ciBonus) {
        const attrName = ch.casterAttr === 'WIT' ? 'Wits' : ch.casterAttr === 'EMP' ? 'Empathy' : null;
        const br = rankOf(ciBonus);
        const header = 'Caster Initiate' + (attrName ? ' (' + attrName + ')' : '') + ': ' + ciBonus + (br > 1 ? ' (Rank ' + br + ')' : '');
        const body = rankTexts(ciBonus, br);
        text = body ? header + ': ' + body : header;
        ranksShown = br;
      } else {
        const r = rankOf(t);
        const body = rankTexts(t, r);
        text = t + ' (Rank ' + r + ')' + (body ? '\n' + body : '');
        ranksShown = r;
      }
      setSmall(talentFields[i], text, ranksShown >= 3 ? 6 : ranksShown === 2 ? 7 : 8);
    });
    // Also set small font on talent rank fields in the main table.
    // Keep this in sync with the earlier page 1 talent fill, including Specialty Talent.
    for (let ti = 1; ti <= 10; ti++) {
      const talent = allTalents[ti - 1] || '';
      setSmall('MP Talent name ' + ti, talent, 11);
      setSmall('MP Talent rank ' + ti, talent ? String(rankOf(talent)) : '', 9);
    }

    const filledBytes = await pdf.save();
    const blob = new Blob([filledBytes], { type:'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (ch.name||'character') + '_RoL_Sheet.pdf';
    a.click();
    URL.revokeObjectURL(url);
  } catch(err) {
    console.error(err);
    alert('PDF generation failed: ' + err.message + '\n\nMake sure Character_Sheet_Form_Fill.pdf is in the same folder as index.html.');
  } finally {
    btn.disabled = false;
    btn.textContent = '⬇ Download Character Sheet PDF';
  }
}

// ═══════════════════════════════════════════════════════════════
// SAVE / LOAD / RESET
// ═══════════════════════════════════════════════════════════════
function saveJSON() {
  const data = {ch, currentStep, savedAt: new Date().toLocaleString()};
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (ch.name||'character') + '_RoL_progress.json';
  a.click();
  // Show save indicator
  const ind = document.getElementById('save-indicator');
  if (ind) {
    ind.textContent = 'Saved at ' + new Date().toLocaleTimeString();
    ind.style.display = 'inline';
  }
}

function loadJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      // Restore into a fresh default state so old/partial saves cannot leave stale values behind.
      ch = mergeCharacterState(data.ch || {});
      pendingLU = null;
      // Go to the saved step
      const targetStep = data.currentStep || 1;
      initAllSteps();
      goToStep(targetStep);
      // Show confirmation
      const ind = document.getElementById('save-indicator');
      if (ind && data.savedAt) {
        ind.textContent = 'Loaded save from ' + data.savedAt;
        ind.style.display = 'inline';
      }
    } catch(err) {
      alert('Failed to load file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function applyStartingGear() {
  if (!ch.specialty || !STARTING_GEAR[ch.specialty]) return;
  const gear = STARTING_GEAR[ch.specialty];
  // Fill equipment slots (armor is slot 0, others go to belt/back)
  gear.forEach((item, i) => { if (i < 6) ch.equip[i] = item; });
  renderDetailsStep();
}


const GEAR_OPTIONS = {"Guardian": [["Short sword", "Hand axe", "Hammer"], ["Small shield"], ["Quilted Vest", "Layered Plate Armor"], ["Backpack"]], "Berserker": [["Long sword", "Mace", "Battle axe"], ["Quilted Vest", "Layered Plate armor"], ["Backpack"]], "Engineer": [["Shortsword", "Flintlock pistol"], ["Small shield", "Bullet pouch"], ["Quilted Vest", "Layered Plate armor"], ["Engineer tool kit"], ["Backpack"]], "Pugilist": [["Quilted Vest", "Layered Plate armor"], ["Limb Wraps"], ["Backpack"]], "Sharpshooter": [["Short bow", "Flintlock pistol", "Crossbow"], ["Arrow quiver", "Bolt pouch", "Bullet pouch"], ["Quilted Vest", "Light Leather armor"], ["Backpack"]], "Elemancer": [["Short sword", "Mace", "Battle axe", "Dagger"], ["Quilted Vest", "Light Leather armor"], ["Backpack"]], "Alchemist": [["Short sword", "Short bow"], ["Dagger", "Arrow quiver"], ["Quilted Vest", "Light Leather armor"], ["Alchemy kit"], ["Backpack"]], "Reaver": [["Short sword", "Short bow"], ["Dagger", "Arrow quiver"], ["Quilted Vest", "Light Leather armor"], ["Backpack"]], "Spellweaver": [["Arcane wand", "Arcane staff"], ["Quilted Vest armor"], ["Backpack"]], "Warlock": [["Arcane wand", "Arcane staff"], ["Quilted Vest armor"], ["Backpack"]], "Oracle": [["Arcane wand", "Arcane staff"], ["Quilted Vest armor", "Light Leather armor"], ["Backpack"]], "Witch": [["Arcane wand", "Arcane staff"], ["Quilted Vest armor"], ["Backpack"]], "Shapeshifter": [["Arcane wand", "Longsword"], ["Quilted Vest", "Layered Plate armor"], ["Backpack"]], "Summoner": [["Arcane wand", "Shortbow and Arrow Quiver", "Shortsword"], ["Quilted Vest armor", "Light Leather armor"], ["Backpack"]], "Sonneteer": [["Arcane wand", "Arcane instrument"], ["Dagger"], ["Dagger"], ["Quilted Vest armor"], ["Backpack"]], "Cleric": [["Arcane staff", "Mace"], ["Quilted Vest armor", "Layered Plate armor"], ["Backpack"]]};

const ARMOR_DP_MAP = {"Quilted Vest": 10, "Quilted Vest armor": 10, "Layered Plate Armor": 20, "Layered Plate armor": 20, "Light Leather armor": null, "Reinforced Tunic": 12, "Brigandine armor set": 16};

// Sharpshooter: ammo container must match the chosen weapon
const SHARPSHOOTER_AMMO_MATCH = {
  'Short bow':        'Arrow quiver',
  'Flintlock pistol': 'Bullet pouch',
  'Crossbow':         'Bolt pouch'
};

function renderGearStep() {
  const el = document.getElementById('gear-step-content');
  if (!el) return;
  if (!ch.specialty || !GEAR_OPTIONS[ch.specialty]) {
    el.innerHTML = '<div class="warn-box">Please choose a Specialty in Step 5 first.</div>';
    return;
  }
  const slots = GEAR_OPTIONS[ch.specialty];
  const silver = STARTING_GEAR[ch.specialty]?.silver || 20;
  if (!ch.gearSelections) ch.gearSelections = {};
  if (!ch.currency.silver) ch.currency.silver = silver;

  // Detect slot types: armor, weapon, other
  const ARMOR_NAMES = ['Quilted Vest','Quilted Vest armor','Layered Plate Armor','Layered Plate armor',
                       'Light Leather armor','Reinforced Tunic','Brigandine armor set'];
  const isArmorSlot = opts => opts.some(o => ARMOR_NAMES.some(a => o.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(o.toLowerCase().replace(' armor',''))));
  const isWeaponSlot = (opts, i) => i === 0 || (!isArmorSlot(opts) && opts.some(o =>
    ['sword','bow','axe','mace','dagger','pistol','wand','staff','crossbow','instrument','hammer'].some(w => o.toLowerCase().includes(w))));

  // Initialize/repair every slot: a selection must be one of THIS specialty's
  // options for that slot. Stale values from a previous specialty (or an old
  // save file) render as an unselected dropdown while the stale value still
  // exports to the PDF — so replace anything invalid with the first option.
  slots.forEach((options, i) => {
    if (!ch.gearSelections[i] || !options.includes(ch.gearSelections[i])) {
      ch.gearSelections[i] = options[0];
      ch.equip[i] = options[0];
    }
  });
  // Drop selections for slots this specialty doesn't have
  Object.keys(ch.gearSelections).forEach(k => {
    if (Number(k) >= slots.length) {
      delete ch.gearSelections[k];
      if (Number(k) < 6) ch.equip[Number(k)] = '';
    }
  });
  // Sharpshooter: force ammo slot (1) to match weapon slot (0).
  // Runs on every render so loaded saves with mismatched picks get corrected too.
  if (ch.specialty === 'Sharpshooter') {
    const matchedAmmo = SHARPSHOOTER_AMMO_MATCH[ch.gearSelections[0]];
    if (matchedAmmo) {
      ch.gearSelections[1] = matchedAmmo;
      ch.equip[1] = matchedAmmo;
    }
  }

  // After init, extract DP
  extractNumericDP();

  el.innerHTML = `
    <div class="info-box" style="margin-bottom:20px">
      <strong>${ch.specialty} Starting Gear</strong> - choose one option per row where multiple are offered.
    </div>
    <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px;margin-bottom:16px">
      <h3 style="font-family:var(--font-ui);font-size:.95rem;font-weight:700;margin-bottom:14px">Equipment Choices</h3>
      ${slots.map((options, i) => {
        const selected = ch.gearSelections[i] || options[0];
        const armor = isArmorSlot(options);
        const weapon = !armor && isWeaponSlot(options, i);
        const label = armor ? 'Armor' : weapon ? `Weapon${i>0?' / Ammo':''}` : 'Other Gear';
        // Sharpshooter ammo slot is derived from the weapon choice — show it locked
        const lockedAmmo = ch.specialty === 'Sharpshooter' && i === 1;
        if (options.length === 1 || lockedAmmo) {
          const shown = lockedAmmo ? (ch.gearSelections[i] || options[0]) : options[0];
          const note = lockedAmmo ? ' <span style="color:var(--text-dim);font-size:.78rem">(matches your weapon)</span>' : '';
          return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
            <label style="font-family:var(--font-ui);font-size:.82rem;font-weight:700;color:var(--text-dim);text-transform:uppercase;min-width:80px">${lockedAmmo ? 'Ammo' : label}</label>
            <div style="flex:1;padding:8px 12px;background:rgba(0,0,0,0.2);border:1px solid transparent;border-radius:6px;font-family:var(--font-ui);font-size:.88rem;color:var(--text-dim)">${shown}${note}</div>
          </div>`;
        }
        return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
          <label style="font-family:var(--font-ui);font-size:.82rem;font-weight:700;color:var(--text-dim);text-transform:uppercase;min-width:80px">${label}</label>
          <select onchange="updateGearSlot(${i}, this.value)"
                  style="flex:1;padding:8px 12px;border:1px solid var(--cyan);border-radius:6px;font-family:var(--font-ui);font-size:.88rem;background:rgba(12, 20, 42, 0.5);color:var(--text);box-shadow: 0 0 10px rgba(79,195,247,0.15);cursor:pointer;">
            ${options.map(opt => `<option value="${opt}" ${selected===opt?'selected':''}>${opt}</option>`).join('')}
          </select>
        </div>`;
      }).join('')}
    </div>
    <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px;margin-bottom:16px">
      <h3 style="font-family:var(--font-ui);font-size:.95rem;font-weight:700;margin-bottom:8px">Auto DP</h3>
      <div id="dp-display" style="font-family:var(--font-ui);font-size:.9rem;color:var(--cyan)">${getArmorDP()}</div>
    </div>
    <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px">
      <h3 style="font-family:var(--font-ui);font-size:.95rem;font-weight:700;margin-bottom:8px">Starting Currency</h3>
      <div style="display:flex;align-items:center;gap:10px;font-family:var(--font-ui)">
        <span style="font-size:1.2rem;font-weight:700;color:var(--cyan)">${silver} Silver</span>
        <span style="color:var(--text-dim);font-size:.88rem">automatically granted by your ${ch.specialty} Specialty</span>
      </div>
    </div>
  `;
}

function updateGearSlot(idx, value) {
  if (!ch.gearSelections) ch.gearSelections = {};
  // Check armor restrictions
  const isArmor = ['Layered Plate Armor','Layered Plate armor'].includes(value);
  if (isArmor) {
    const str = getEffectiveAttr('STR');
    if (str < 2) {
      alert('Layered Plate Armor requires at least Strength Rank 2. Your current Strength is Rank ' + str + '. Please assign Strength to 2 or higher before selecting this armor.');
      // Revert to previous or first option
      const slots = GEAR_OPTIONS[ch.specialty] || [];
      const options = slots[idx] || [];
      ch.gearSelections[idx] = options.find(o => !['Layered Plate Armor','Layered Plate armor'].includes(o)) || options[0];
      ch.equip[idx] = ch.gearSelections[idx];
      renderGearStep();
      return;
    }
  }
  ch.gearSelections[idx] = value;
  ch.equip[idx] = value;
  // Sharpshooter: picking a weapon swaps in the matching ammo container
  if (ch.specialty === 'Sharpshooter' && idx === 0 && SHARPSHOOTER_AMMO_MATCH[value]) {
    ch.gearSelections[1] = SHARPSHOOTER_AMMO_MATCH[value];
    ch.equip[1] = SHARPSHOOTER_AMMO_MATCH[value];
    renderGearStep(); // redraw so the locked ammo row updates
    return;
  }
  // Auto-calculate DP if armor changed
  const dpText = getArmorDP();
  const dpEl = document.getElementById('dp-display');
  if (dpEl) dpEl.textContent = dpText;
  // Store numeric DP in ch for PDF export
  extractNumericDP();
}

function getArmorDP() {
  if (!ch.gearSelections) return 'Select armor above to see DP.';
  const vals = Object.values(ch.gearSelections);
  for (const v of vals) {
    if (ARMOR_DP_MAP[v] !== undefined) {
      if (ARMOR_DP_MAP[v] === null) {
        // Light Leather = Agility × 3
        const agi = getEffectiveAttr('AGI');
        const dp  = agi * 3;
        ch.dp = dp;
        return `Light Leather Armor: DP = Agility (${agi}) × 3 = ${dp}`;
      }
      ch.dp = ARMOR_DP_MAP[v];
      return `${v}: ${ARMOR_DP_MAP[v]} DP`;
    }
  }
  ch.dp = 0;
  return 'No armor selected - 0 DP.';
}

function extractNumericDP() {
  if (!ch.gearSelections) return;
  const vals = Object.values(ch.gearSelections);
  let hasArmor = false;
  for (const v of vals) {
    if (ARMOR_DP_MAP[v] !== undefined) {
      ch.dp = (ARMOR_DP_MAP[v] === null) ? (getEffectiveAttr('AGI') * 3) : ARMOR_DP_MAP[v];
      hasArmor = true;
      break;
    }
  }
  if (!hasArmor) ch.dp = 0;
  // Hardened Shell (Pridae Evolved Purpose) adds +5 max DP when wearing armor
  if (isPrideaHardenedShell() && hasArmor) {
    ch.dp += 5;
  }
  if (ch.specialty === 'Guardian' && hasArmor) {
    ch.dp += 5;
  }
  if (hasArmor) {
    const modRank = getCharacterTalents().get('Master of Defense') || 0;
    if (modRank) ch.dp += [0, 4, 12, 24, 40, 60][modRank];
  }
}

function isPrideaHardenedShell() {
  return isPridae() && ch.evolvedPurpose === 'Hardened Shell';
}


function autoFillGear() {
  if (!ch.specialty || !STARTING_GEAR[ch.specialty]) return;
  const items = [...STARTING_GEAR[ch.specialty].items];
  // Slot 0 = armor, rest go to back/belt in order
  let slotIdx = 0;
  items.forEach(item => {
    if (slotIdx < 6) { ch.equip[slotIdx] = item; slotIdx++; }
  });
  renderGearStep();
}


function toggleTalentView(name) {
  const scrollY = window.scrollY;
  const alreadyPicked = (ch.talents||[]).includes(name);
  const isMartial  = MARTIAL_TALENTS.includes(name);
  const isSorcery  = SORCERY_TALENTS.includes(name);
  const currentMartial  = (ch.talents||[]).find(t => MARTIAL_TALENTS.includes(t));
  const currentSorcery  = (ch.talents||[]).find(t => SORCERY_TALENTS.includes(t));

  if (alreadyPicked) {
    // Clicking the already-selected talent: just view it (toggle detail view)
    ch._viewingTalent = (ch._viewingTalent === name) ? null : name;
  } else if (isMartial && currentMartial) {
    // Replace existing martial selection with this one
    removeTalentByName(currentMartial);
    addTalentFromView(name);
    ch._viewingTalent = name;
  } else if (isSorcery && currentSorcery) {
    // Replace existing sorcery selection with this one
    removeTalentByName(currentSorcery);
    addTalentFromView(name);
    ch._viewingTalent = name;
  } else {
    // Normal select
    addTalentFromView(name);
    ch._viewingTalent = name;
  }
  renderTalentStep();
  window.scrollTo({top: scrollY, behavior: 'instant'});
}

function addTalentFromView(name) {
  if (!ch.talents) ch.talents = Array(9).fill('');
  // Check limits
  const isMartial = MARTIAL_TALENTS.includes(name);
  const isSorcery = SORCERY_TALENTS.includes(name);
  const isGeneral = GENERAL_TALENTS.includes(name);
  if (isMartial && ch.talents.filter(t=>MARTIAL_TALENTS.includes(t)).length >= 1) {
    alert('You can only select 1 Martial Talent at Level 1.'); return;
  }
  if (isSorcery && ch.talents.filter(t=>SORCERY_TALENTS.includes(t)).length >= 1) {
    alert('You can only select 1 Sorcery Talent at Level 1.'); return;
  }
  // Warlock: chosen Study becomes Patron's Gift in specialty talent
  if (isSorcery && ch.specialty === 'Warlock') {
    ch.specialtyTalent = "Patron's Gift: " + name + " is your Patron's Gift. Spells from your Patron's Gift cost 1 less Sorce to cast (minimum cost of 1 Sorce).";
  }
  if (isGeneral) {
    alert('General Talents are not selected during character creation. Only 1 Martial or Sorcery Talent is chosen at Level 1.'); return;
  }
  const emptyIdx = ch.talents.findIndex(t => !t);
  if (emptyIdx === -1) { alert('All talent slots are filled. Remove one first.'); return; }
  ch.talents[emptyIdx] = name;
  renderTalentStep();
}

function removeTalentByName(name) {
  if (!ch.talents) return;
  const idx = ch.talents.indexOf(name);
  if (idx !== -1) { ch.talents[idx] = ''; }
  if (ch._viewingTalent === name) ch._viewingTalent = null;
  // If Warlock removes their Study, reset specialty talent
  if (ch.specialty === 'Warlock' && WARLOCK_STUDIES.includes(name)) {
    ch.specialtyTalent = SPECIALTY_TALENT_TEXT['Warlock'] || 'Warlock Specialty Talent';
  }
  renderTalentStep();
}

function getTalentDescription(name, highlightRank) {
  // Returns HTML table of rank info for a talent, with the relevant rank highlighted
  const hl = Math.max(1, highlightRank || 1);
  const t = TALENT_DATA[name];
  if (!t) return `<p style="font-style:italic;color:var(--muted)">Full details in the Realms of Legacy Talents chapter.</p>`;

  let html = `<table style="width:100%;border-collapse:collapse;font-size:.82rem;font-family:var(--font-ui)">
    <thead><tr>
      <th style="background:rgba(8,13,28,0.9);color:var(--gold);padding:6px 10px;text-align:left;width:70px">Rank</th>
      <th style="background:rgba(8,13,28,0.9);color:var(--text-dim);padding:6px 10px;text-align:left">Description</th>
    </tr></thead><tbody>`;
  t.forEach((row, i) => {
    const isHL = i === hl - 1;
    const bg   = isHL ? 'background:rgba(201,168,76,0.15);font-weight:700' : (i%2===0?'background:rgba(255,255,255,0.02)':'background:rgba(255,255,255,0.04)');
    html += `<tr style="${bg}">
      <td style="padding:6px 10px;border-bottom:1px solid var(--rule);vertical-align:top;white-space:nowrap;font-weight:700;color:var(--gold)">Rank ${i+1}${isHL?' ★':''}</td>
      <td style="padding:6px 10px;border-bottom:1px solid var(--rule);line-height:1.45;color:var(--text)">${row}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
}


function startOver() {
  if (!confirm('Start over? All progress will be lost.')) return;
  location.reload();
}

// ═══════════════════════════════════════════════════════════════
// STEP 12 - LEVEL UP SYSTEM
// ═══════════════════════════════════════════════════════════════
// Per level beyond 1: +7 Status Points (HP/MP), +2 Skill Points, 1 Talent Point.
// Specialty Talent rank auto-increases at levels 2, 6, 11, 18; Reliable feature at 20.
const SPECIALTY_RANK_LEVELS = [2, 6, 11, 18];
// Sorcery talents that build on Studies — gated until a Study of Sorcery is known
const ADVANCED_SORCERY_PREREQ = ['Elemental Attunement', 'Megamind', 'Spell Slinger', 'Twist Magicka', 'War Caster'];

function preparedSpellsLimit() {
  const k = getSpellcastingAttrKey();
  if (!k) return null;
  return Math.floor(getLevel() / 2) + getEffectiveAttr(k);
}

let pendingLU = null;
function freshPendingLU() { return { hp: 0, mp: 0, skills: {}, talent: null, bonusTalent: null, casterAttr: null, attrChoice: null, bonusAttr: null, minMaxDown: null, minMaxUp: null, reliableAttr: null, _view: null, _showSpecialty: false }; }

// getEffectiveAttr() only counts confirmed level-ups, so a picker that consults it
// cannot see the other choices being made in the *same* level-up. That let a player
// stack the +1 Attribute Point on top of Naturally Gifted or Min Max targeting the
// same Attribute and land on Rank 7.
//
// This returns the rank an Attribute would end at once the pending level-up is
// confirmed. Pass the slot being edited as ignoreSlot so a picker measures the
// headroom left by the *other* slots rather than locking itself out.
function luProjectedAttr(key, ignoreSlot) {
  let v = getEffectiveAttr(key);
  if (!pendingLU) return v;
  if (ignoreSlot !== 'attrChoice' && pendingLU.attrChoice === key) v += 1;
  const t = pendingLU.talent;
  if (t && t.kind === 'new') {
    if (t.name === 'Naturally Gifted' && ignoreSlot !== 'bonusAttr' && pendingLU.bonusAttr === key) v += 1;
    if (t.name === 'Min Max') {
      if (ignoreSlot !== 'minMaxUp'   && pendingLU.minMaxUp   === key) v += 2;
      if (ignoreSlot !== 'minMaxDown' && pendingLU.minMaxDown === key) v -= 1;
    }
  }
  return v;
}

// Attributes the pending level-up would push past the cap (or below 0), used as a
// final guard in case a stale pendingLU slips past the pickers.
function luAttrCapViolations() {
  return ATTRIBUTES
    .map(a => ({ name: a.name, rank: luProjectedAttr(a.key, null) }))
    .filter(a => a.rank > ATTR_RANK_MAX || a.rank < 0);
}

function pendingSkillBudget() {
  let b = 2;
  if (EXTRA_SKILL_LEVELS.includes(getLevel() + 1)) b += 1; // +1 additional Skill Point at levels 8 and 14
  const t = pendingLU?.talent;
  if (t && t.kind === 'new' && t.name === 'Skilled') b += 4; // "You get four additional Skill Points"
  return b;
}
function trimSkillOverflow() {
  if (!pendingLU) return;
  const budget = pendingSkillBudget();
  let spent = Object.values(pendingLU.skills).reduce((a, b) => a + b, 0);
  const keys = Object.keys(pendingLU.skills);
  while (spent > budget && keys.length) {
    const k = keys[keys.length - 1];
    pendingLU.skills[k]--;
    if (!pendingLU.skills[k]) { delete pendingLU.skills[k]; keys.pop(); }
    spent--;
  }
}

function luAdjustStatus(stat, delta) {
  if (!pendingLU) return;
  const cur = pendingLU[stat] || 0;
  const total = (pendingLU.hp || 0) + (pendingLU.mp || 0);
  if (delta > 0 && total >= 7) return;
  if (delta < 0 && cur <= 0) return;
  pendingLU[stat] = cur + delta;
  renderLevelUp();
}

function luAdjustSkill(key, delta) {
  if (!pendingLU) return;
  const target = getLevel() + 1;
  const cur = pendingLU.skills[key] || 0;
  const spent = Object.values(pendingLU.skills).reduce((a, b) => a + b, 0);
  if (delta > 0) {
    if (spent >= pendingSkillBudget()) return;
    if (getSkillRank(key) + cur + 1 > skillCapAtLevel(target)) return;
    pendingLU.skills[key] = cur + 1;
  } else {
    if (cur <= 0) return;
    pendingLU.skills[key] = cur - 1;
    if (!pendingLU.skills[key]) delete pendingLU.skills[key];
  }
  renderLevelUp();
}

function luPickTalent(kind, name) {
  if (!pendingLU) return;
  if (pendingLU.talent && pendingLU.talent.kind === kind && pendingLU.talent.name === name) {
    pendingLU.talent = null; pendingLU.bonusTalent = null; pendingLU.casterAttr = null;
    pendingLU.bonusAttr = null; pendingLU.minMaxDown = null; pendingLU.minMaxUp = null;
    pendingLU._view = null;
  } else {
    pendingLU.talent = { kind, name };
    pendingLU.bonusTalent = null; pendingLU.casterAttr = null;
    pendingLU.bonusAttr = null; pendingLU.minMaxDown = null; pendingLU.minMaxUp = null;
    pendingLU._view = name;
  }
  trimSkillOverflow();
  renderLevelUp();
}
function luPickBonus(name) {
  if (!pendingLU) return;
  pendingLU.bonusTalent = pendingLU.bonusTalent === name ? null : name;
  pendingLU._view = pendingLU.bonusTalent ? name : pendingLU._view;
  renderLevelUp();
}
function luPickCasterAttr(k) {
  if (!pendingLU) return;
  pendingLU.casterAttr = k;
  renderLevelUp();
}
function luPickAttr(field, key) {
  if (!pendingLU) return;
  pendingLU[field] = pendingLU[field] === key ? null : key;
  renderLevelUp();
}
function luViewTalent(name) {
  if (!pendingLU) return;
  pendingLU._view = pendingLU._view === name ? null : name;
  renderLevelUp();
}

// Which brand-new talents can be bought with this level's Talent Point
function luNewTalentGroups() {
  const owned = new Set(getCharacterTalents().keys());
  const isMartialClass = ch.cls === 'Fighter' || ch.cls === 'Vagabond';
  const isCasterClass = ch.cls === 'Magi' || ch.cls === 'Druid';
  const hasStudy = [...owned].some(t => t.startsWith('Study of'));
  const notOwned = list => list.filter(t => !owned.has(t));
  const sorceryLock = t => (ADVANCED_SORCERY_PREREQ.includes(t) && !hasStudy) ? 'Requires a Study of Sorcery talent' : null;
  const groups = [];
  if (isMartialClass) groups.push({ label: 'Martial Talents', list: notOwned(MARTIAL_TALENTS), lockedFn: null });
  if (isCasterClass) groups.push({ label: 'Sorcery Talents', list: notOwned(SORCERY_TALENTS_ALL), lockedFn: sorceryLock });
  groups.push({ label: 'General Talents', list: notOwned(GENERAL_TALENTS), lockedFn: null });
  return groups;
}

// Owned talents that can still be ranked up with this level's Talent Point
function luRankUpOptions(targetLv) {
  const map = getCharacterTalents();
  const cap = talentCapAtLevel(targetLv);
  return [...map.entries()]
    .filter(([t, r]) => TALENT_DATA[t] && r < TALENT_DATA[t].length && r < 5 && r < cap)
    .map(([t, r]) => ({ name: t, rank: r }));
}

function confirmLevelUp() {
  if (!pendingLU) return;
  const target = getLevel() + 1;
  const status = (pendingLU.hp || 0) + (pendingLU.mp || 0);
  if (status !== 7) { alert('Allocate all 7 Status Points between HP and MP (' + status + '/7 allocated).'); return; }
  const spent = Object.values(pendingLU.skills || {}).reduce((a, b) => a + b, 0);
  const budget = pendingSkillBudget();
  if (spent !== budget) { alert('Spend all ' + budget + ' Skill Points (' + spent + '/' + budget + ' spent).'); return; }
  if (!pendingLU.talent) { alert('Spend your Talent Point: gain a new Talent or rank one up.'); return; }
  if (ATTR_POINT_LEVELS.includes(target) && !pendingLU.attrChoice) { alert('Choose the Attribute to increase with your +1 Attribute Point.'); return; }
  if (target === 20 && !pendingLU.reliableAttr) { alert('Choose your Reliable Attribute.'); return; }
  if (pendingLU.talent.kind === 'new' && pendingLU.talent.name === 'Warfare Initiate' && !pendingLU.bonusTalent) {
    alert('Warfare Initiate grants a Rank 1 Martial Talent — choose it before confirming.'); return;
  }
  if (pendingLU.talent.kind === 'new' && pendingLU.talent.name === 'Caster Initiate') {
    if (!pendingLU.bonusTalent) { alert('Caster Initiate: choose the Sorcery Talent it grants.'); return; }
    const needsAttr = (ch.cls === 'Fighter' || ch.cls === 'Vagabond') && (pendingLU.bonusTalent.startsWith('Study of') || pendingLU.bonusTalent === 'Innate Magic');
    if (needsAttr && !pendingLU.casterAttr) { alert('Caster Initiate: choose your spellcasting attribute (Wits or Empathy).'); return; }
  }
  if (pendingLU.talent.kind === 'new' && pendingLU.talent.name === 'Naturally Gifted' && !pendingLU.bonusAttr) { alert('Naturally Gifted: choose the Attribute to increase.'); return; }
  if (pendingLU.talent.kind === 'new' && pendingLU.talent.name === 'Min Max' && (!pendingLU.minMaxDown || !pendingLU.minMaxUp || pendingLU.minMaxDown === pendingLU.minMaxUp)) { alert('Min Max: choose one Attribute to decrease and a different one to increase.'); return; }
  // The pickers already lock out over-cap combinations; this catches a pendingLU
  // left inconsistent by re-picking (e.g. swapping talents after choosing an Attribute).
  const capViolations = luAttrCapViolations();
  if (capViolations.length) {
    alert('These choices would put ' + capViolations.map(a => a.name + ' at Rank ' + a.rank).join(', ')
      + '. An Attribute cannot go above Rank ' + ATTR_RANK_MAX + ' or below Rank 0 — change one of this level\'s Attribute choices.');
    return;
  }
  const entry = {
    level: target, hp: pendingLU.hp, mp: pendingLU.mp,
    skills: { ...pendingLU.skills }, talent: pendingLU.talent,
    bonusTalent: pendingLU.bonusTalent || null, casterAttr: pendingLU.casterAttr || null,
    attrChoice: pendingLU.attrChoice || null, bonusAttr: pendingLU.bonusAttr || null,
    minMaxDown: pendingLU.minMaxDown || null, minMaxUp: pendingLU.minMaxUp || null,
    reliableAttr: pendingLU.reliableAttr || null,
    skillBudget: budget,
  };
  ch.levelUps.push(entry);
  if (entry.talent && entry.talent.name === 'Caster Initiate') ch.casterAttr = entry.casterAttr;
  if (entry.reliableAttr) ch.reliableAttr = entry.reliableAttr;
  ch.level = getLevel();
  pendingLU = null;
  updateProgress();
  renderLevelUp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function undoLastLevel() {
  if (!(ch.levelUps || []).length) return;
  if (!confirm('Undo Level ' + getLevel() + '? Its allocations will be removed.')) return;
  const last = ch.levelUps.pop();
  if (last && last.talent && last.talent.name === 'Caster Initiate') ch.casterAttr = null;
  if (last && last.reliableAttr) ch.reliableAttr = null;
  ch.level = getLevel();
  pendingLU = null;
  updateProgress();
  renderLevelUp();
}

function luTalentTypeLabel(name) {
  if (MARTIAL_TALENTS.includes(name)) return 'Martial Talent';
  if (SORCERY_TALENTS_ALL.includes(name)) return 'Sorcery Talent';
  if (GENERAL_TALENTS.includes(name)) return 'General Talent';
  return 'Talent';
}

// Bold "Ability Name:" prefixes and short standalone headers in specialty text
function formatSpecialtyAbilities(text) {
  return esc(text).split('\n').map(l => {
    const m = l.match(/^([A-Z][^:]{0,60}?)(\s*\([^)]*\))?:\s*(.*)$/);
    if (m) return '<strong style="color:var(--gold-pale)">' + m[1] + (m[2] || '') + ':</strong> ' + m[3];
    if (/^[A-Z][A-Za-z\u2019' -]{2,30}$/.test(l.trim())) return '<strong style="color:var(--gold-pale)">' + l.trim() + '</strong>';
    return l;
  }).join('\n');
}

function renderLevelUp() {
  const el = document.getElementById('levelup-content');
  if (!el) return;
  const lvl = getLevel();
  const ready = ch.cls && ch.specialty;
  const spellLimit = preparedSpellsLimit();

  const loadRow = `
    <div style="display:flex;gap:10px;margin-bottom:20px;align-items:center;flex-wrap:wrap">
      <div style="font-family:var(--font-ui);font-size:.88rem;color:var(--muted)">Have a saved character (Level 1 or higher)?</div>
      <button class="btn btn-secondary" style="padding:8px 16px;font-size:.85rem" onclick="document.getElementById('load-file-lu').click()">📂 Load Character JSON</button>
      <input type="file" id="load-file-lu" accept=".json" style="display:none" onchange="loadJSON(event)">
    </div>`;

  if (!ready) {
    el.innerHTML = loadRow + '<div class="warn-box">Finish creating a Level 1 character (Steps 1–10), or load a saved character JSON, before leveling up.</div>';
    return;
  }

  const stripGroups = [
    ['Attributes', [
      ['STR', getEffectiveAttr('STR'), 'var(--gold-pale)'],
      ['AGI', getEffectiveAttr('AGI'), 'var(--gold-pale)'],
      ['WIT', getEffectiveAttr('WIT'), 'var(--gold-pale)'],
      ['EMP', getEffectiveAttr('EMP'), 'var(--gold-pale)'],
    ]],
    ['Status Points', [
      ['Max HP', calcHP(), 'var(--danger)'],
      ['Max MP', calcMP(), 'var(--cyan)'],
      ['Sorce', calcSP(), '#c084fc'],
      ['Recovery', lvl >= 19 ? lvl + 'd8' : lvl, 'var(--gold-pale)'],
    ]],
    ['Progression', [
      ['Specialty Rank', specialtyRankAtLevel(lvl), 'var(--safe)'],
      ['Skill Cap', skillCapAtLevel(lvl), 'var(--text)'],
      ['Talent Cap', talentCapAtLevel(lvl), 'var(--text)'],
      ...(spellLimit !== null ? [['Prepared Spells', spellLimit, 'var(--cyan)']] : []),
    ]],
  ];

  let html = `
  <div style="background:var(--mid); border: 1px solid var(--border-gold); border-radius: var(--r); padding: 20px; margin-bottom: 30px;">
    <h2 style="font-family:var(--font-section); color:var(--gold); margin-bottom:16px; border-bottom: 1px solid var(--border-gold); padding-bottom: 8px;">Current Character Status</h2>
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:stretch;margin-bottom:20px">
      <div style="background:rgba(201,168,76,0.1);border:1px solid var(--border-gold);border-radius:var(--r);padding:14px 22px;text-align:center;min-width:110px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-family:var(--font-heading);font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold)">Level</div>
        <div style="font-family:var(--font-section);font-size:2.4rem;font-weight:700;color:var(--gold-pale);line-height:1.1">${lvl}</div>
        <div style="font-family:var(--font-ui);font-size:.72rem;color:var(--text-dim)">${esc(ch.name || 'Unnamed')} · ${esc(ch.cls)} ${esc(ch.specialty)}</div>
      </div>
      ${stripGroups.map(([groupLabel, cards]) => `
        <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:10px 14px 12px;backdrop-filter:blur(4px)">
          <div style="font-family:var(--font-heading);font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid var(--card-border)">${groupLabel}</div>
          <div style="display:flex;gap:14px">
            ${cards.map(([label, val, color]) => `
              <div style="text-align:center;min-width:60px">
                <div style="font-family:var(--font-heading);font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim)">${label}</div>
                <div style="font-family:var(--font-heading);font-size:1.7rem;font-weight:700;color:${color}">${val}</div>
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>` + loadRow;

  // Current character state — specialty + talent ranks (mirrors the Step 11 review)
  const talMap = getCharacterTalents();
  const attrNameOf = k => k === 'WIT' ? 'Wits' : k === 'EMP' ? 'Empathy' : k;
  const nextSpecLvl = SPECIALTY_RANK_LEVELS.find(m => m > lvl);
  html += `<div style="display:flex;flex-direction:column;gap:20px;margin-bottom:20px">
    <div class="summary-block">
      <h3>Specialty — ${esc(ch.specialty || '-')}</h3>
      <div class="summary-row"><span class="s-label">Current Rank</span><span class="s-val" style="color:var(--safe)">Rank ${specialtyRankAtLevel(lvl)}</span></div>
      <div class="summary-row"><span class="s-label">Next Rank Up</span><span class="s-val">${nextSpecLvl ? 'Level ' + nextSpecLvl : '—'}</span></div>
      ${(() => {
        const sr = specialtyRankAtLevel(lvl);
        let summary = SPECIALTY_PDF_SUMMARY[ch.specialty];
        if (summary && ch.specialty === 'Warlock') {
          const ws = (ch.talents || []).find(t => WARLOCK_STUDIES.includes(t));
          if (ws) summary = summary.map(s => s.replace('your chosen Study of Sorcery', ws));
        }
        const boldTitles = s => esc(s).replace(/(?<=(?:^|\n|\. ))([A-Z][A-Za-z'’-]*(?: (?:[A-Z][A-Za-z'’-]*|and|the|of|or)){0,5}(?: \([^)]*\))?):/g, '<strong style="color:var(--text)">$1:</strong>');
        const subRank = s => String(s).replace(/\{rank3\}/g, sr * 3).replace(/\{rank2\}/g, sr * 2).replace(/\{rank\}/g, sr);
        if (summary) {
          return summary.slice(0, sr).map((s, i) => `<div style="margin-top:12px"><div style="font-family:var(--font-ui);font-size:.66rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--safe)">Rank ${i + 1}${i + 1 === sr ? ' — current' : ''}</div><div style="font-family:var(--font-ui);font-size:.82rem;color:var(--text-dim);line-height:1.55;white-space:pre-line">${boldTitles(subRank(s))}</div></div>`).join('');
        }
        return ch.specialtyTalent ? `<div style="font-family:var(--font-ui);font-size:.8rem;color:var(--text-dim);line-height:1.5;margin-top:10px">${esc(ch.specialtyTalent)}</div>` : '';
      })()}
    </div>
    <div class="summary-block">
      <h3>Talents — Current Ranks</h3>
      ${[...talMap.entries()].map(([tn, tr]) => `<div class="summary-row"><span class="s-label">${esc(tn)}${tn === 'Caster Initiate' && ch.casterAttr ? ' (' + attrNameOf(ch.casterAttr) + ')' : ''}</span><span class="s-val">Rank ${tr}</span></div>`).join('') || '<div style="font-family:var(--font-ui);font-size:.8rem;color:var(--muted)">No talents recorded.</div>'}
    </div>
  </div>`;

  // History of confirmed level-ups
  const hist = ch.levelUps || [];
  if (hist.length) {
    html += `<div class="summary-block" style="margin-bottom:20px">
      <h3>Level-Up History</h3>
      ${hist.map(l => {
        const skillsTxt = Object.entries(l.skills || {}).map(([k, v]) => k + ' +' + v).join(', ') || '—';
        let talentTxt = '—';
        if (l.talent) {
          talentTxt = l.talent.kind === 'rankup'
            ? 'Rank Up: ' + l.talent.name
            : 'New: ' + l.talent.name
              + (l.bonusTalent ? ' (+ ' + l.bonusTalent + ')' : '')
              + (l.casterAttr ? ' — spellcasting: ' + (l.casterAttr === 'WIT' ? 'Wits' : 'Empathy') : '');
        }
        const extraBits = [];
        if (l.attrChoice) extraBits.push('+1 ' + l.attrChoice);
        if (l.bonusAttr) extraBits.push('+1 ' + l.bonusAttr);
        if (l.minMaxUp) extraBits.push('−1 ' + l.minMaxDown + ' / +2 ' + l.minMaxUp);
        if (l.reliableAttr) extraBits.push('Reliable: ' + l.reliableAttr);
        if (extraBits.length) talentTxt += ' · ' + extraBits.join(', ');
        return `<div class="summary-row"><span class="s-label" style="white-space:nowrap">Level ${l.level}</span><span class="s-val" style="font-weight:500;text-align:right">+${l.hp} HP / +${l.mp} MP · ${esc(skillsTxt)} · ${esc(talentTxt)}</span></div>`;
      }).join('')}
      <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:10px"><span style="font-family:var(--font-ui);font-size:.75rem;color:var(--muted)">Creation steps 1–10 are locked while level-ups exist — undo them to edit.</span><button class="btn btn-secondary" style="padding:6px 14px;font-size:.72rem" onclick="undoLastLevel()">↩ Undo Level ${lvl}</button></div>
    </div>`;
  }

  // Export / save row — shown above the next-level editor
  html += `<div style="margin-bottom:20px;text-align:center;border-bottom:1px solid var(--border);padding-bottom:20px">
      <button class="btn btn-export" onclick="exportPDF()">⬇ Download Character Sheet PDF — Level ${lvl}</button>
      <button class="btn btn-secondary" style="margin-left:12px" onclick="saveJSON()">💾 Save Progress (JSON)</button>
      ${lvl < 20 ? `<p style="font-family:var(--font-ui);font-size:.78rem;color:var(--muted);margin-top:10px">The PDF contains your last confirmed level (${lvl}). Choices for Level ${lvl + 1} below are only included after you confirm them.</p>` : ''}
    </div>`;

  if (lvl >= 20) {
    html += '<div class="info-box">★ Maximum level reached — Level 20. Your Specialty Talent has its <strong>Reliable</strong> additional feature (see the Core Rulebook).</div>';
  } else {
    if (!pendingLU) pendingLU = freshPendingLU();
    const target = lvl + 1;
    const chip = (label, selected, locked, onclick) =>
      `<button ${locked ? '' : 'onclick="' + onclick + '"'} title="${locked || ''}" style="padding:5px 12px;font-family:var(--font-ui);font-size:.82rem;font-weight:600;cursor:${locked ? 'not-allowed' : 'pointer'};border-radius:20px;transition:all .12s;border:1px solid ${selected ? 'rgba(74,222,128,0.5)' : 'var(--border)'};background:${selected ? 'rgba(74,222,128,0.12)' : 'var(--surface)'};color:${selected ? 'var(--safe)' : 'var(--text)'};opacity:${locked ? 0.35 : 1}">${label}${selected ? ' ✓' : ''}</button>`;

    const milestones = [];
    if (SPECIALTY_RANK_LEVELS.includes(target)) {
      const newRank = specialtyRankAtLevel(target);
      const sd = SPECIALTY_RANK_DATA[ch.specialty];
      const rankText = sd && sd.ranks[newRank - 1] ? ' ' + esc(sd.ranks[newRank - 1]) : '';
      milestones.push(`Your <strong>${esc(ch.specialty)} Specialty Talent</strong> advances to <strong>Rank ${newRank}</strong>.${rankText} <a href="javascript:void(0)" onclick="pendingLU._showSpecialty=!pendingLU._showSpecialty;renderLevelUp()" style="color:var(--cyan)">${pendingLU._showSpecialty ? 'Hide' : 'View'} full ability details</a>`);
    }
    if (target === 19) milestones.push('<strong>' + esc(LEVEL19_RECOVERY_TEXT) + '</strong>');
    if (target === 20) milestones.push('<strong>Choose one Attribute below. This Attribute becomes your Reliable Attribute.</strong> ' + esc(RELIABLE_ATTRIBUTE_TEXT));
    if (ATTR_POINT_LEVELS.includes(target)) milestones.push('You gain <strong>+1 Attribute Point</strong> — allocate it below.');
    if (EXTRA_SKILL_LEVELS.includes(target)) milestones.push('You gain <strong>1 additional Skill Point</strong> at this level (3 total).');
    if (skillCapAtLevel(target) > skillCapAtLevel(lvl)) milestones.push(`Skill rank cap increases to <strong>${skillCapAtLevel(target)}</strong>.`);
    if (talentCapAtLevel(target) > talentCapAtLevel(lvl)) milestones.push(`Talent rank cap increases to <strong>${talentCapAtLevel(target)}</strong>.`);

    html += `<div style="background:var(--card-bg); border: 1px solid var(--cyan); border-radius: var(--r); padding: 20px; box-shadow: 0 0 15px rgba(79,195,247,0.1);"><div class="step-header" style="margin-top:8px;margin-bottom:14px; border-bottom: 1px solid var(--cyan); padding-bottom: 10px;"><h2 style="font-size:1.4rem; color:var(--cyan);">Available Upgrades for Level ${target}</h2></div>`;
    if (milestones.length) html += `<div class="info-box" style="margin-bottom:16px">${milestones.map(m => '★ ' + m).join('<br>')}</div>`;

    if (pendingLU._showSpecialty && SPECIALTY_RANK_DATA[ch.specialty]) {
      const sd = SPECIALTY_RANK_DATA[ch.specialty];
      html += `<div style="background:rgba(8,13,28,0.6);border:1px solid var(--card-border);border-radius:var(--r);padding:14px;margin-bottom:16px;font-family:var(--font-ui);font-size:.84rem;line-height:1.55;white-space:pre-wrap;color:var(--text)"><div style="font-family:var(--font-heading);font-weight:700;color:var(--gold-pale);margin-bottom:8px">${esc(ch.specialty)} Specialty Talent</div>${sd.ranks.map((r, i) => '<strong style="color:var(--gold)">Rank ' + (i + 1) + ':</strong> ' + formatSpecialtyAbilities(r)).join('\n')}\n\n${formatSpecialtyAbilities(sd.abilities)}</div>`;
    }

    if (target === 20) {
      html += `<div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px;margin-bottom:16px;backdrop-filter:blur(4px)">
        <h3 style="font-family:var(--font-ui);font-size:.95rem;font-weight:700;margin-bottom:4px">★ Reliable Attribute</h3>
        <div class="${pendingLU.reliableAttr ? 'info-box' : 'warn-box'}" style="margin:8px 0 14px">Choose the Attribute that becomes your Reliable Attribute.</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px">
          ${ATTRIBUTES.map(a => chip(a.name, pendingLU.reliableAttr === a.key, null, "luPickAttr('reliableAttr','" + a.key + "')")).join('')}
        </div>
      </div>`;
    }

    if (ATTR_POINT_LEVELS.includes(target)) {
      html += `<div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px;margin-bottom:16px;backdrop-filter:blur(4px)">
        <h3 style="font-family:var(--font-ui);font-size:.95rem;font-weight:700;margin-bottom:4px">★ Attribute Point</h3>
        <div class="${pendingLU.attrChoice ? 'info-box' : 'warn-box'}" style="margin:8px 0 14px">Choose one Attribute to increase by 1 (max Rank 6). Raising Strength or Agility increases your max HP by 2; raising Wits or Empathy increases your max MP and Sorce by 2.</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px">
          ${ATTRIBUTES.map(a => {
            const cur = getEffectiveAttr(a.key);
            const proj = luProjectedAttr(a.key, 'attrChoice');
            const locked = proj + 1 > ATTR_RANK_MAX
              ? (cur >= ATTR_RANK_MAX ? 'Already at Rank ' + ATTR_RANK_MAX : 'Would exceed Rank ' + ATTR_RANK_MAX + ' with this level\'s other choices')
              : null;
            const label = a.name + ' (' + cur + (pendingLU.attrChoice === a.key ? ' → ' + (cur + 1) : '') + ')';
            return chip(label, pendingLU.attrChoice === a.key, locked, "luPickAttr('attrChoice','" + a.key + "')");
          }).join('')}
        </div>
      </div>`;
    }

    // ── Status points ──
    const remaining = 7 - (pendingLU.hp || 0) - (pendingLU.mp || 0);
    const btnS = 'width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:var(--surface);font-size:1.1rem;color:var(--text);cursor:pointer;font-weight:700';
    html += `<div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px;margin-bottom:16px;backdrop-filter:blur(4px)">
      <h3 style="font-family:var(--font-ui);font-size:.95rem;font-weight:700;margin-bottom:4px">1 · Status Points</h3>
      <div class="${remaining === 0 ? 'info-box' : 'warn-box'}" style="margin:8px 0 14px"><strong>${remaining}</strong> of 7 points remaining. Points added to MP also raise your max Sorce.</div>
      <div style="display:flex;gap:20px;flex-wrap:wrap">
        ${[['hp', 'Max HP', 'var(--danger)', calcHP()], ['mp', 'Max MP', 'var(--cyan)', calcMP()]].map(([k, label, color, cur]) => `
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--surface);border:1px solid ${color};border-radius:var(--r);padding:12px 22px;min-width:150px">
            <span style="font-family:var(--font-heading);font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${color}">${label}</span>
            <span style="font-family:var(--font-heading);font-size:1.5rem;font-weight:700;color:var(--gold-pale)">${cur}<span style="color:var(--safe);font-size:1.05rem"> +${pendingLU[k] || 0}</span></span>
            <span style="display:flex;gap:10px">
              <button style="${btnS}" onclick="luAdjustStatus('${k}',-1)">−</button>
              <button style="${btnS}" onclick="luAdjustStatus('${k}',1)">+</button>
            </span>
          </div>`).join('')}
      </div>
    </div>`;

    // ── Skill points ──
    const budget = pendingSkillBudget();
    const spent = Object.values(pendingLU.skills || {}).reduce((a, b) => a + b, 0);
    const cap = skillCapAtLevel(target);
    html += `<div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px;margin-bottom:16px;backdrop-filter:blur(4px)">
      <h3 style="font-family:var(--font-ui);font-size:.95rem;font-weight:700;margin-bottom:4px">2 · Skill Points</h3>
      <div class="${spent === budget ? 'info-box' : 'warn-box'}" style="margin:8px 0 14px"><strong>${budget - spent}</strong> of ${budget} skill points remaining. Max skill rank at Level ${target}: <strong>${cap}</strong>.${budget > 2 ? ' <em>(Includes bonus points from your chosen Talent.)</em>' : ''}</div>
      ${Object.entries(SKILLS).map(([attrKey, skills]) => `
        <div class="skill-section">
          <h3>${ATTRIBUTES.find(a => a.key === attrKey).name} Skills</h3>
          <div class="skill-grid" style="grid-template-columns:repeat(auto-fill,minmax(215px,1fr))">
            ${skills.map(s => {
              const base = getSkillRank(s.key);
              const add = pendingLU.skills[s.key] || 0;
              const canAdd = base + add < cap && spent < budget;
              return `<div class="skill-chip ${add > 0 ? 'selected' : ''}" style="cursor:default;padding:7px 8px 7px 10px">
                <span class="rank-pip" style="flex-shrink:0">${base + add}</span>
                <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name}</span>
                <span style="color:var(--safe);font-weight:700;font-size:.82rem;min-width:22px;text-align:right;flex-shrink:0">${add > 0 ? '+' + add : ''}</span>
                <span style="display:flex;gap:3px;flex-shrink:0">
                  <button onclick="luAdjustSkill('${s.key}',-1)" style="width:24px;height:24px;border-radius:4px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;opacity:${add > 0 ? 1 : .3}">−</button>
                  <button onclick="luAdjustSkill('${s.key}',1)" style="width:24px;height:24px;border-radius:4px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;opacity:${canAdd ? 1 : .3}">+</button>
                </span>
              </div>`;
            }).join('')}
          </div>
        </div>`).join('')}
    </div>`;

    // ── Talent point ──
    const t = pendingLU.talent;
    const rankUps = luRankUpOptions(target);
    const groups = luNewTalentGroups();

    html += `<div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--r);padding:16px;margin-bottom:16px;backdrop-filter:blur(4px)">
      <h3 style="font-family:var(--font-ui);font-size:.95rem;font-weight:700;margin-bottom:4px">3 · Talent Point</h3>
      <div class="${t ? 'info-box' : 'warn-box'}" style="margin:8px 0 14px">${t
        ? 'Selected: <strong>' + esc(t.kind === 'rankup' ? t.name + ' → Rank ' + (((getCharacterTalents().get(t.name)) || 1) + 1) : t.name) + '</strong> — click it again to deselect.'
        : 'Spend your 1 Talent Point: rank up an existing Talent or gain a new one. Max talent rank at Level ' + target + ': <strong>' + talentCapAtLevel(target) + '</strong>.'}</div>`;

    if (rankUps.length) {
      html += `<div style="margin-bottom:16px">
        <h3 style="font-family:var(--font-ui);font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:8px">Rank Up an Existing Talent</h3>
        <div style="display:flex;flex-wrap:wrap;gap:7px">
          ${rankUps.map(o => chip(o.name + ' → Rank ' + (o.rank + 1), t && t.kind === 'rankup' && t.name === o.name, null, "luPickTalent('rankup','" + o.name.replace(/'/g, "\\'") + "')")).join('')}
        </div>
      </div>`;
    }
    groups.forEach(g => {
      if (!g.list.length) return;
      html += `<div style="margin-bottom:16px">
        <h3 style="font-family:var(--font-ui);font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:8px">${g.label}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:7px">
          ${g.list.map(name => {
            const locked = g.lockedFn ? g.lockedFn(name) : null;
            return chip(name, t && t.kind === 'new' && t.name === name, locked, "luPickTalent('new','" + name.replace(/'/g, "\\'") + "')");
          }).join('')}
        </div>
      </div>`;
    });

    if (t && t.kind === 'new' && t.name === 'Warfare Initiate') {
      html += `<div class="info-box" style="margin-top:4px">Warfare Initiate grants one <strong>Rank 1 Martial Talent</strong> — choose it:</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:8px">
          ${MARTIAL_TALENTS.filter(n => !getCharacterTalents().has(n)).map(n => chip(n, pendingLU.bonusTalent === n, null, "luPickBonus('" + n.replace(/'/g, "\\'") + "')")).join('')}
        </div>`;
    }
    if (t && t.kind === 'new' && t.name === 'Caster Initiate') {
      const ownedNow = getCharacterTalents();
      const hasStudyNow = [...ownedNow.keys()].some(n => n.startsWith('Study of'));
      html += `<div class="info-box" style="margin-top:4px">Caster Initiate: choose the <strong>Sorcery Talent</strong> you learn (Rank 1).</div>
        ${!hasStudyNow ? '<div class="warn-box" style="margin-top:8px">Some options are not selectable because they require you to already have a Study of Sorcery.</div>' : ''}
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:8px">
          ${SORCERY_TALENTS_ALL.filter(n => !ownedNow.has(n)).map(n => {
            const locked = (ADVANCED_SORCERY_PREREQ.includes(n) && !hasStudyNow && n !== pendingLU.bonusTalent) ? 'Requires a Study of Sorcery talent' : null;
            return chip(n, pendingLU.bonusTalent === n, locked, "luPickBonus('" + n.replace(/'/g, "\\'") + "')");
          }).join('')}
        </div>`;
      const needsAttr = (ch.cls === 'Fighter' || ch.cls === 'Vagabond') && pendingLU.bonusTalent && (pendingLU.bonusTalent.startsWith('Study of') || pendingLU.bonusTalent === 'Innate Magic');
      if (needsAttr) {
        html += `<div class="info-box" style="margin-top:10px">You gain Spellcasting — choose your <strong>Spellcasting Attribute</strong>:</div>
        <div style="display:flex;gap:7px;margin-top:8px">
          ${chip('Wits', pendingLU.casterAttr === 'WIT', null, "luPickCasterAttr('WIT')")}
          ${chip('Empathy', pendingLU.casterAttr === 'EMP', null, "luPickCasterAttr('EMP')")}
        </div>`;
      }
    }
    if (t && t.kind === 'new' && t.name === 'Naturally Gifted') {
      html += `<div class="info-box" style="margin-top:4px">Naturally Gifted: choose the Attribute to increase by 1 (max Rank ${ATTR_RANK_MAX}).</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:8px">
          ${ATTRIBUTES.map(a => {
            const cur = getEffectiveAttr(a.key);
            const proj = luProjectedAttr(a.key, 'bonusAttr');
            const locked = proj + 1 > ATTR_RANK_MAX
              ? (cur >= ATTR_RANK_MAX ? 'Already at Rank ' + ATTR_RANK_MAX : 'Would exceed Rank ' + ATTR_RANK_MAX + ' with this level\'s Attribute Point')
              : null;
            return chip(a.name + ' (' + cur + ')', pendingLU.bonusAttr === a.key, locked, "luPickAttr('bonusAttr','" + a.key + "')");
          }).join('')}
        </div>`;
    }
    if (t && t.kind === 'new' && t.name === 'Min Max') {
      html += `<div class="info-box" style="margin-top:4px">Min Max: decrease one Attribute Rank by 1, then increase a different Attribute Rank by 2 (max Rank ${ATTR_RANK_MAX}).</div>
        <div style="font-family:var(--font-ui);font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin:10px 0 6px">Decrease by 1</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px">${ATTRIBUTES.map(a => {
          const cur = getEffectiveAttr(a.key);
          const locked = luProjectedAttr(a.key, 'minMaxDown') - 1 < 0 ? 'Already at Rank 0' : null;
          return chip(a.name + ' (' + cur + ')', pendingLU.minMaxDown === a.key, locked, "luPickAttr('minMaxDown','" + a.key + "')");
        }).join('')}</div>
        <div style="font-family:var(--font-ui);font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin:10px 0 6px">Increase by 2</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px">${ATTRIBUTES.map(a => {
          const cur = getEffectiveAttr(a.key);
          const proj = luProjectedAttr(a.key, 'minMaxUp');
          const locked = a.key === pendingLU.minMaxDown
            ? 'Same as decreased Attribute'
            : (proj + 2 > ATTR_RANK_MAX
                ? (proj === cur ? 'Would exceed Rank ' + ATTR_RANK_MAX : 'Would exceed Rank ' + ATTR_RANK_MAX + ' with this level\'s Attribute Point')
                : null);
          return chip(a.name + ' (' + cur + ')', pendingLU.minMaxUp === a.key, locked, "luPickAttr('minMaxUp','" + a.key + "')");
        }).join('')}</div>`;
    }

    if (pendingLU._view) {
      html += `<div style="margin-top:14px;background:rgba(8,13,28,0.6);border:1px solid var(--card-border);border-radius:var(--r);padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div><span style="font-family:var(--font-ui);font-weight:700;color:var(--gold-pale)">${esc(pendingLU._view)}</span> <span style="font-family:var(--font-ui);font-size:.75rem;color:var(--muted)">· ${luTalentTypeLabel(pendingLU._view)}</span></div>
          <button onclick="pendingLU._view=null;renderLevelUp()" style="padding:4px 10px;background:var(--surface);border:1px solid var(--border);border-radius:6px;cursor:pointer;color:var(--text);font-family:var(--font-ui);font-size:.8rem">✕</button>
        </div>
        ${getTalentDescription(pendingLU._view, (getCharacterTalents().get(pendingLU._view) || 0) + 1)}
      </div>`;
    }
    html += '</div>'; // close talent card

    html += `<div style="text-align:center;margin:24px 0 8px">
      <button class="btn btn-export" onclick="confirmLevelUp()">⇧ Confirm Level ${target}</button>
    </div>`;
  }

  el.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
function initAllSteps() {
  // Safe init: only render steps that have been reached, or render defensively
  renderArrayPicker();
  renderSkillList();
  renderLineageGrid();
  if (ch.lineage) {
    const detail = document.getElementById('lineage-detail');
    if (detail) { detail.style.display = 'block'; renderLineageDetail(); }
  }
  renderClassGrid();
  if (ch.cls) renderClassSkillChoices();
  renderSpecialtyGrid();
  renderLifepath();
  // Only render step 8 & 9 if their key containers exist
  if (document.getElementById('talent-browser')) renderTalentStep();
  if (document.getElementById('notable-slots'))  renderDetailsStep();
}

document.addEventListener('DOMContentLoaded', () => {
  initAllSteps();
  goToStep(1);

  // Sync live fields on step changes
  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentStep === 10) {
      ch.name    = document.getElementById('char-name').value;
      ch.level   = getLevel();

      ch.notes   = document.getElementById('char-notes').value;
    }
  });

  // Re-render dependent steps when navigating back
  document.querySelectorAll('.prog-step').forEach(el => {
    el.addEventListener('click', () => {
      const s = parseInt(el.dataset.step);
      if (s < currentStep) {
        if (s === 2) renderSkillList();
        if (s === 3) renderLineageGrid();
        if (s === 4) { renderClassGrid(); renderClassSkillChoices(); }
        if (s === 5) renderSpecialtyGrid();
        if (s === 7) renderLifepath();
        if (s === 8) renderTalentStep();
        if (s === 9) renderDetailsStep();
      }
    });
  });
});
