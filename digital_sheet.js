let currentJSON = null;

const DEFAULT_WOUNDS = 5;
const DEFAULT_TRAUMAS = 4;
const DEFAULT_PACK_SLOTS = 16;
const DEFAULT_EQUIP_SLOTS = 6;
const DEFAULT_POUCH_SLOTS = 6;

function loadSheet(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data || !data.ch) throw new Error("Invalid character JSON");
            currentJSON = data;
            ch = mergeCharacterState(data.ch);
            
            initSheetData();
            renderSheet();
        } catch (err) {
            alert("Error loading JSON: " + err.message);
        }
    };
    reader.readAsText(file);
}

function initSheetData() {
    if (!ch.sheetData) ch.sheetData = {};
    const d = ch.sheetData;
    
    d.hpCurrent = d.hpCurrent ?? calcHP();
    d.mpCurrent = d.mpCurrent ?? calcMP();
    d.spCurrent = d.spCurrent ?? calcSP();
    d.dpCurrent = d.dpCurrent ?? ((typeof calcDP === 'function') ? calcDP() : '0');
    
    d.specResName = d.specResName || "";
    d.specResCurrent = d.specResCurrent || 0;
    d.specResMax = d.specResMax || 0;
    
    if(!d.wounds) d.wounds = Array(DEFAULT_WOUNDS).fill().map(()=>({injury:'', effect:'', rec:''}));
    if(!d.traumas) d.traumas = Array(DEFAULT_TRAUMAS).fill().map(()=>({injury:'', effect:'', rec:''}));
    
    if(!d.equipInv) d.equipInv = Array(DEFAULT_EQUIP_SLOTS).fill('');
    if(!d.pouchInv) d.pouchInv = Array(DEFAULT_POUCH_SLOTS).fill('');
    if(!d.packInv) d.packInv = Array(DEFAULT_PACK_SLOTS).fill('');
    
    d.coinSilver = d.coinSilver ?? ch.currency?.silver ?? 0;
    d.coinGold = d.coinGold ?? 0;
    d.coinPluther = d.coinPluther ?? 0;
    
    d.lifepathNotes = d.lifepathNotes || _deriveLifepathDefaults();
    d.characters = d.characters || "";
    d.loot = d.loot || "";
    d.curses = d.curses || "";
    d.notes = d.notes || "";
    d.spellNotes = d.spellNotes || {};
    
    if(!d.customAttacks) d.customAttacks = [];
}

function _deriveLifepathDefaults() {
    if(!ch.lifepath) return "";
    let s = "";
    if(ch.lifepath.upbringing) s += `Upbringing: ${ch.lifepath.upbringing}\n`;
    if(ch.lifepath.culture) s += `Culture: ${ch.lifepath.culture}\n`;
    if(ch.lifepath.decisions) s += `Decisions: ${ch.lifepath.decisions}\n`;
    if(ch.lifepath.viewOfOthers) s += `View of Others: ${ch.lifepath.viewOfOthers}\n`;
    if(ch.lifepath.personality) s += `Personality: ${ch.lifepath.personality}\n`;
    if(ch.lifepath.value) s += `Values: ${ch.lifepath.value}\n`;
    if(ch.lifepath.upset) s += `Upsets: ${ch.lifepath.upset}\n`;
    return s.trim();
}

function escapeHtml(unsafe) {
    return (unsafe || '').toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function renderSheet() {
    document.getElementById('placeholder').style.display = 'none';
    document.getElementById('sheet-content').style.display = 'block';
    
    document.getElementById('ds-name').textContent = ch.name || 'Unnamed';
    document.getElementById('ds-subtitle').textContent = `${ch.lineage || '-'} ${ch.cls || '-'} ${ch.specialty || '-'}`;
    
    const lvl = getLevel();
    document.getElementById('ds-level').textContent = lvl;
    
    document.getElementById('ds-hp-max').textContent = calcHP();
    document.getElementById('ds-mp-max').textContent = calcMP();
    document.getElementById('ds-dp-max').textContent = ch.dp || '0';
    document.getElementById('ds-sp-max').textContent = calcSP();
    document.getElementById('ds-recovery').textContent = lvl >= 19 ? lvl + 'd8' : lvl;
    
    document.getElementById('ds-hp-current').value = ch.sheetData.hpCurrent;
    document.getElementById('ds-mp-current').value = ch.sheetData.mpCurrent;
    document.getElementById('ds-dp-current').value = ch.sheetData.dpCurrent;
    document.getElementById('ds-sp-current').value = ch.sheetData.spCurrent;
    
    document.getElementById('ds-spec-res-name').value = ch.sheetData.specResName;
    document.getElementById('ds-spec-res-current').value = ch.sheetData.specResCurrent;
    document.getElementById('ds-spec-res-max').value = ch.sheetData.specResMax;

    // Attributes and Skills
    let attrSkillHtml = '';
    ATTRIBUTES.forEach(a => {
        attrSkillHtml += `<div class="attr-group">
            <div class="attr-header"><span>${a.name}</span><span>${getEffectiveAttr(a.key)}</span></div>`;
        const skillsForAttr = Object.values(SKILLS).flat().filter(s => s.attr === a.key);
        skillsForAttr.forEach(s => {
            let rank = getSkillRank(s.key);
            if (rank > 0) {
                attrSkillHtml += `<div class="skill-item"><span>${s.name}</span><span class="val">${rank}</span></div>`;
            }
        });
        attrSkillHtml += `</div>`;
    });
    document.getElementById('ds-attr-skills').innerHTML = attrSkillHtml;

    // Wounds & Traumas
    document.getElementById('ds-wounds').innerHTML = ch.sheetData.wounds.map((w,i) => `
        <div style="display:flex;gap:4px;margin-bottom:6px">
            <input type="text" class="edit-input-text" style="flex:2" placeholder="Injury" value="${escapeHtml(w.injury)}" onchange="updateArray('wounds',${i},'injury',this.value)">
            <input type="text" class="edit-input-text" style="flex:3" placeholder="Effect" value="${escapeHtml(w.effect)}" onchange="updateArray('wounds',${i},'effect',this.value)">
            <input type="text" class="edit-input-text" style="flex:1" placeholder="Rec." title="Recovery L F P" value="${escapeHtml(w.rec)}" onchange="updateArray('wounds',${i},'rec',this.value)">
        </div>`).join('');
    
    document.getElementById('ds-traumas').innerHTML = ch.sheetData.traumas.map((t,i) => `
        <div style="display:flex;gap:4px;margin-bottom:6px">
            <input type="text" class="edit-input-text" style="flex:2" placeholder="Injury" value="${escapeHtml(t.injury)}" onchange="updateArray('traumas',${i},'injury',this.value)">
            <input type="text" class="edit-input-text" style="flex:3" placeholder="Effect" value="${escapeHtml(t.effect)}" onchange="updateArray('traumas',${i},'effect',this.value)">
            <input type="text" class="edit-input-text" style="flex:1" placeholder="Rec." title="Recovery L F P" value="${escapeHtml(t.rec)}" onchange="updateArray('traumas',${i},'rec',this.value)">
        </div>`).join('');

    // Weapons & Attacks
    let wepHtml = '';
    const equips = (ch.equip || []).filter(e => e && typeof WEAPON_STATS !== 'undefined' && WEAPON_STATS[e]);
    equips.forEach(eq => {
        const w = WEAPON_STATS[eq];
        let dice = w.skill; // Simplified, usually stat + skill
        wepHtml += `<div class="weapon-card">
            <div class="weapon-header"><span>${eq}</span></div>
            <div class="weapon-stats"><span>Range: ${w.range}</span><span>Mod: ${w.mod}</span><span style="color:var(--gold-pale)">Dmg: ${w.damage}</span></div>
            <div class="weapon-stats" style="margin-top:4px;"><span>Pool: ${dice}</span><span>Feat: ${w.features}</span></div>
        </div>`;
    });
    ch.sheetData.customAttacks.forEach((ca, i) => {
        wepHtml += `<div class="weapon-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <input type="text" style="width:40%; font-weight:700; color:var(--cyan);" placeholder="Name" value="${escapeHtml(ca.name)}" onchange="updateCustomAttack(${i},'name',this.value)">
                <input type="text" style="width:20%;" placeholder="Range" value="${escapeHtml(ca.range)}" onchange="updateCustomAttack(${i},'range',this.value)">
                <input type="text" style="width:15%;" placeholder="Mod" value="${escapeHtml(ca.mod)}" onchange="updateCustomAttack(${i},'mod',this.value)">
                <input type="text" style="width:20%; color:var(--gold-pale);" placeholder="Damage" value="${escapeHtml(ca.damage)}" onchange="updateCustomAttack(${i},'damage',this.value)">
            </div>
            <div style="display:flex; justify-content:space-between;">
                <input type="text" style="width:40%;" placeholder="Dice Pool" value="${escapeHtml(ca.pool)}" onchange="updateCustomAttack(${i},'pool',this.value)">
                <input type="text" style="width:58%;" placeholder="Features" value="${escapeHtml(ca.features)}" onchange="updateCustomAttack(${i},'features',this.value)">
            </div>
        </div>`;
    });
    if(!wepHtml) wepHtml = '<div style="color:var(--text-dim);font-size:.85rem;font-family:var(--font-ui);">No weapons equipped.</div>';
    document.getElementById('ds-weapons').innerHTML = wepHtml;

    // Inventory
    document.getElementById('ds-equip').innerHTML = ch.sheetData.equipInv.map((item,i) => `
        <div style="margin-bottom:6px"><input type="text" class="edit-input-text" placeholder="Equipped Item..." value="${escapeHtml(item)}" onchange="updateArray('equipInv',${i},null,this.value)"></div>`).join('');
    document.getElementById('ds-pouch').innerHTML = ch.sheetData.pouchInv.map((item,i) => `
        <div style="margin-bottom:6px"><input type="text" class="edit-input-text" placeholder="Pouch Item..." value="${escapeHtml(item)}" onchange="updateArray('pouchInv',${i},null,this.value)"></div>`).join('');
    document.getElementById('ds-backpack').innerHTML = ch.sheetData.packInv.map((item,i) => `
        <div style="display:flex;gap:8px;margin-bottom:6px;align-items:center;">
            <span style="font-family:var(--font-heading);color:var(--muted);width:20px;text-align:right;">${i+1}</span>
            <input type="text" class="edit-input-text" placeholder="Backpack Item..." value="${escapeHtml(item)}" onchange="updateArray('packInv',${i},null,this.value)">
        </div>`).join('');
    
    document.getElementById('ds-coin-silver').value = ch.sheetData.coinSilver;
    document.getElementById('ds-coin-gold').value = ch.sheetData.coinGold;
    document.getElementById('ds-coin-pluther').value = ch.sheetData.coinPluther;
    
    const getSlots = () => {
        let b = 10;
        if(ch.gearSelections && Object.values(ch.gearSelections).some(v => v.includes('Backpack'))) b = 16;
        if(ch.equip && ch.equip.some(v => v.includes('Backpack'))) b = 16;
        return b;
    };
    document.getElementById('ds-pack-slots').textContent = getSlots();

    // Lore & Traits
    document.getElementById('ds-lineage-traits').innerHTML = escapeHtml(ch.lineageBenefits || "No lineage benefits recorded.");
    document.getElementById('ds-spec-talent').innerHTML = escapeHtml(ch.specialtyTalent || "No specialty talent recorded.");
    
    let talentHtml = '';
    const talentsMap = getCharacterTalents();
    for (const [tName, tRank] of talentsMap.entries()) {
        const fullDesc = getTalentFullDescription(tName, tRank);
        const escapedDesc = escapeHtml(fullDesc).replace(/\n/g, '<br>');
        talentHtml += `<div class="wound-card">
            <div style="font-family:var(--font-heading); color:var(--cyan); font-weight:700; margin-bottom:4px;">${escapeHtml(tName)} <span style="color:var(--text-dim); font-size:0.8rem;">(Rank ${tRank})</span></div>
            <div style="font-family:var(--font-ui); font-size:0.85rem; color:var(--text);">${escapedDesc}</div>
        </div>`;
    }
    if(!talentHtml) talentHtml = '<div style="color:var(--text-dim);font-size:.85rem;font-family:var(--font-ui);">No talents learned.</div>';
    document.getElementById('ds-full-talents').innerHTML = talentHtml;

    document.getElementById('ds-lifepath').value = ch.sheetData.lifepathNotes;
    document.getElementById('ds-characters').value = ch.sheetData.characters;
    document.getElementById('ds-loot').value = ch.sheetData.loot;
    document.getElementById('ds-curses').value = ch.sheetData.curses;
    document.getElementById('ds-notes').value = ch.sheetData.notes;

    // Spells
    let spellGroups = {};
    if(ch.talents) {
        ch.talents.forEach(t => {
            if(t.startsWith('Study of') || t === 'Innate Magic' || t === 'Runic Magic') {
                if(typeof STUDY_SPELLS !== 'undefined' && STUDY_SPELLS[t]) {
                    Object.keys(STUDY_SPELLS[t]).forEach(rank => {
                        const rNum = parseInt(rank.replace('rank',''));
                        if(!spellGroups[rNum]) spellGroups[rNum] = [];
                        spellGroups[rNum].push(...STUDY_SPELLS[t][rank]);
                    });
                }
            }
        });
    }

    let spHtml = '';
    if(Object.keys(spellGroups).length > 0) {
        Object.keys(spellGroups).sort((a,b)=>a-b).forEach(rank => {
            spHtml += `<h3 style="margin-top:20px;">Rank ${rank} Spells</h3>`;
            spellGroups[rank].forEach(sp => {
                const noteText = escapeHtml(ch.sheetData.spellNotes[sp.name] || '');
                spHtml += `
                <div class="spell-entry">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px; flex-wrap:wrap;">
                        <span class="spell-name" style="width:30%; min-width:120px;">${escapeHtml(sp.name)}</span>
                        <span style="font-size:0.8rem; color:var(--text-dim);"><span style="color:var(--gold-pale)">PL:</span> ${sp.pl}</span>
                        <span style="font-size:0.8rem; color:var(--text-dim);"><span style="color:var(--gold-pale)">Range:</span> ${sp.range}</span>
                        <span style="font-size:0.8rem; color:var(--text-dim);"><span style="color:var(--gold-pale)">Cast:</span> ${sp.ct}</span>
                        <span style="font-size:0.8rem; color:var(--text-dim);"><span style="color:var(--gold-pale)">Dur:</span> ${sp.dur}</span>
                    </div>
                    <textarea class="edit-textarea" style="margin-top:4px; min-height:40px; padding:4px 8px; font-size:0.85rem;" placeholder="Add notes for this spell..." onchange="updateSpellNote('${escapeHtml(sp.name.replace(/'/g, "\'"))}', this.value)">${noteText}</textarea>
                </div>`;
            });
        });
    } else {
        spHtml = '<div style="color:var(--text-dim);font-size:.85rem;font-family:var(--font-ui);">No spell studies learned.</div>';
    }
    document.getElementById('spells-wrapper').innerHTML = spHtml;
}

function getTalentFullDescription(name, rank) {
    if (typeof TALENT_DATA !== 'undefined' && TALENT_DATA[name]) {
        return TALENT_DATA[name].slice(0, rank).map((desc, i) => `Rank ${i+1}: ${desc}`).join('\n');
    }
    return "Description not found.";
}

function updateData(key, value) {
    if(['hpCurrent','mpCurrent','dpCurrent','spCurrent','specResCurrent','specResMax','coinSilver','coinGold','coinPluther'].includes(key)) {
        value = parseInt(value, 10) || 0;
    }
    ch.sheetData[key] = value;
}

function updateArray(arrName, idx, subKey, value) {
    if(subKey) {
        ch.sheetData[arrName][idx][subKey] = value;
    } else {
        ch.sheetData[arrName][idx] = value;
    }
}

function addCustomAttack() {
    ch.sheetData.customAttacks.push({name:'', range:'', mod:'', damage:'', pool:'', features:''});
    renderSheet();
}

function updateCustomAttack(idx, field, value) {
    ch.sheetData.customAttacks[idx][field] = value;
}

function updateSpellNote(spellName, value) {
    ch.sheetData.spellNotes[spellName] = value;
}

function exportSheet() {
    if (!currentJSON) return alert("No character loaded.");
    currentJSON.ch = ch;
    currentJSON.savedAt = new Date().toLocaleString();
    
    const blob = new Blob([JSON.stringify(currentJSON, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (ch.name || 'character') + '_RoL_digital_sheet.json';
    a.click();
}

function attemptLevelUp() {
    document.getElementById('save-reminder-modal').style.display = 'flex';
}

function closeSaveReminder() {
    document.getElementById('save-reminder-modal').style.display = 'none';
}

function proceedToBuilder() {
    if (currentJSON) {
        currentJSON.ch = ch;
        sessionStorage.setItem('transferJSON', JSON.stringify(currentJSON));
    }
    window.location.href = 'index.html';
}
