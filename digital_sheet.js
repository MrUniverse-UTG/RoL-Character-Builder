let currentJSON = null;

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
            
            if (!ch.sheetData) {
                ch.sheetData = {
                    hpCurrent: calcHP(),
                    mpCurrent: calcMP(),
                    spCurrent: calcSP(),
                    notes: ch.notes || "",
                    spellNotes: {}
                };
            }
            // Ensure spellNotes exists for backwards compatibility
            if(!ch.sheetData.spellNotes) ch.sheetData.spellNotes = {};
            
            renderSheet();
        } catch (err) {
            alert("Error loading JSON: " + err.message);
        }
    };
    reader.readAsText(file);
}

function escapeHtml(unsafe) {
    return (unsafe || '').toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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
    // Assuming calcDP exists, if not we will just skip it or set to 0. It's normally calculated in builder.js or shared.js.
    document.getElementById('ds-dp-max').textContent = (typeof calcDP === 'function') ? calcDP() : '0';
    document.getElementById('ds-sp-max').textContent = calcSP();
    
    document.getElementById('ds-recovery').textContent = lvl >= 19 ? lvl + 'd8' : lvl;
    
    document.getElementById('ds-hp-current').value = ch.sheetData.hpCurrent ?? calcHP();
    document.getElementById('ds-mp-current').value = ch.sheetData.mpCurrent ?? calcMP();
    document.getElementById('ds-dp-current').value = ch.sheetData.dpCurrent ?? ((typeof calcDP === 'function') ? calcDP() : '0');
    document.getElementById('ds-sp-current').value = ch.sheetData.spCurrent ?? calcSP();
    
    let attrHtml = '';
    ATTRIBUTES.forEach(a => {
        attrHtml += `<div class="stat-row"><span class="stat-label">${a.name}</span><span class="stat-value highlight">${getEffectiveAttr(a.key)}</span></div>`;
    });
    document.getElementById('ds-attributes').innerHTML = attrHtml;
    
    let skillHtml = '';
    Object.values(SKILLS).flat().forEach(s => {
        let rank = getSkillRank(s.key);
        if (rank > 0) {
            skillHtml += `<div class="stat-row"><span class="stat-label">${s.name}</span><span class="stat-value" style="color:var(--safe)">Rank ${rank}</span></div>`;
        }
    });
    if(!skillHtml) skillHtml = '<div style="color:var(--text-dim);font-size:.85rem;font-family:var(--font-ui);">No skills learned.</div>';
    document.getElementById('ds-skills').innerHTML = skillHtml;
    
    let talentHtml = '';
    const talents = getCharacterTalents();
    for (const [tName, tRank] of talents.entries()) {
        talentHtml += `<div class="stat-row"><span class="stat-label">${escapeHtml(tName)}</span><span class="stat-value" style="color:var(--cyan)">Rank ${tRank}</span></div>`;
    }
    if(!talentHtml) talentHtml = '<div style="color:var(--text-dim);font-size:.85rem;font-family:var(--font-ui);">No talents learned.</div>';
    document.getElementById('ds-talents').innerHTML = talentHtml;
    
    document.getElementById('ds-notes').value = ch.sheetData.notes || '';
    
    const spells = [];
    if(ch.talents) {
        ch.talents.forEach(t => {
            if(t.startsWith('Study of') || t === 'Innate Magic' || t === 'Runic Magic') {
                if(STUDY_SPELLS[t]) {
                    spells.push(...STUDY_SPELLS[t]);
                }
            }
        });
    }
    
    if (spells.length > 0) {
        document.getElementById('spells-section').style.display = 'block';
        let spellsHtml = '';
        spells.forEach((sp, i) => {
            const noteText = escapeHtml(ch.sheetData.spellNotes[sp.name] || '');
            spellsHtml += `
            <div class="spell-entry">
                <div class="spell-entry-header" onclick="toggleSpellNotes(${i})">
                    <span class="spell-name">${escapeHtml(sp.name)}</span>
                    <span style="font-size:0.8rem; color:var(--text-dim);">PL: ${sp.pl} | Cost: ${sp.ct} ${sp.focus ? '(Focus)' : ''}</span>
                    <span style="color:var(--gold);">▼</span>
                </div>
                <div class="spell-notes" id="spell-notes-${i}">
                    <textarea class="edit-textarea" style="margin-top:10px; min-height:60px;" placeholder="Add notes for this spell..." onchange="updateSpellNote('${escapeHtml(sp.name.replace(/'/g, "\\'"))}', this.value)">${noteText}</textarea>
                </div>
            </div>`;
        });
        document.getElementById('ds-spells').innerHTML = spellsHtml;
    } else {
        document.getElementById('spells-section').style.display = 'none';
    }
}

function toggleSpellNotes(idx) {
    const el = document.getElementById(`spell-notes-${idx}`);
    if(el.classList.contains('open')) {
        el.classList.remove('open');
    } else {
        el.classList.add('open');
    }
}

function updateSheetData(key, value) {
    if(key === 'hpCurrent' || key === 'mpCurrent' || key === 'dpCurrent' || key === 'spCurrent') value = parseInt(value, 10);
    ch.sheetData[key] = value;
}

function updateSpellNote(spellName, value) {
    if(!ch.sheetData.spellNotes) ch.sheetData.spellNotes = {};
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


function openLevelUp() {
    if (!currentJSON) {
        alert("Please load a character first.");
        return;
    }
    currentJSON.ch = ch;
    sessionStorage.setItem('transferJSON', JSON.stringify(currentJSON));
    window.location.href = 'index.html';
}
