const browserAPI = window.browser || window.chrome;
// check for other movement speeds
// check temp hp on medium/small screens
function scrapeCharacterData() {
    const maxRetries = 10; // Maximum number of retries
    const retryDelay = 1000; // Delay between retries (in milliseconds)
    const characterData = {errors: []};

    function closeSidebar() {
        document.querySelector('button[aria-label="Hide sidebar"]')?.click();
    }

    function tryScraping(retriesLeft) {
        const charSheet = document.querySelector('div.ct-character-sheet__inner');

        // function get(characterData) {
        //     try {
        //     } catch(error) {
        //         characterData.errors.push({func: get', error});
        //     }
        // }

        if (charSheet) {
            characterData.errors = [];

            (function getName(characterData) {
                try {
                    characterData.name = charSheet.querySelector('.ddbc-character-tidbits__heading').querySelector('h1').textContent;
                } catch(error) {
                    characterData.errors.push({func: getName, error});
                }
            })(characterData);

            (function getRace(characterData) {
                try {
                    characterData.race = charSheet.querySelector('span.ddbc-character-summary__race').textContent;
                } catch(error) {
                    characterData.errors.push({func: getRace, error});
                }
            })(characterData);

            (function getClasses(characterData) {
                try {
                    characterData.classes = charSheet.querySelector('span.ddbc-character-summary__classes').textContent.split(' / ').map(item => {
                        let [className, level] = item.split(' ');
                        return { name: className, level: parseInt(level, 10) };
                    });
                } catch(error) {
                    characterData.errors.push({func: getClasses, error});
                }
            })(characterData);

            (function getLevel(characterData) {
                try {
                    characterData.level = Array.from(charSheet.querySelector('div.ddbc-character-progression-summary__level').childNodes).filter(node => node.nodeType === Node.TEXT_NODE)[1].textContent.trim();
                } catch(error) {
                    characterData.errors.push({func: getLevel, error});
                }
            })(characterData);

            (function getHp(characterData) {
                try {
                    characterData.hp = {};
                    const hpArr = charSheet.querySelector('div.ct-health-summary__hp-number')?.textContent ? charSheet.querySelectorAll('div.ct-health-summary__hp-number') : null;
                    characterData.hp.current = hpArr[0]?.textContent ? hpArr[0].textContent 
                        : charSheet.querySelector('span.ct-status-summary-mobile__hp-current') ? parseInt(charSheet.querySelector('span.ct-status-summary-mobile__hp-current').textContent, 10) 
                        : null;
                    characterData.hp.max = hpArr[1]?.textContent ? hpArr[1].textContent
                        : charSheet.querySelector('span.ct-status-summary-mobile__hp-max').textContent ? parseInt(charSheet.querySelector('span.ct-status-summary-mobile__hp-max').textContent, 10)
                        : null;
                    characterData.hp.temp = hpArr[2]?.textContent ? hpArr[2].textContent : null;
                } catch(error) {
                    characterData.errors.push({func: getHp, error});
                }
            })(characterData);

            (function getHeroicInsperation(characterData) {
                try {
                    // ADD FUNCTIONALITY FOR OTHER SCREEN SIZES
                    characterData.heroicInsperation = charSheet.querySelector('div[data-testid="inspiration"]').getAttribute('aria-checked');
                } catch(error) {
                    characterData.errors.push({func: getHeroicInsperation, error});
                }
            })(characterData);

            (function getProficiencyBonus(characterData) {
                try {
                    characterData.proficiencyBonus = parseInt(charSheet.querySelector('div.ct-proficiency-bonus-box__value').children[0].children[1].textContent, 10);
                } catch(error) {
                    characterData.errors.push({func: getProficiencyBonus, error});
                }
            })(characterData);

            // UPDATE TO ACCOUNT FOR OTHER TYPES OF MOVEMENT
            (function getSpeed(characterData) {
                try {
                    characterData.Speed = parseInt(charSheet.querySelector('div.ct-speed-box__box-value').children[0].children[0].textContent, 10);
                } catch(error) {
                    characterData.errors.push({func: getSpeed, error});
                }
            })(characterData);

            (function getInitiative(characterData) {
                try {
                    characterData.initiative = parseInt(charSheet.querySelector('div.ct-combat__summary-group.ct-combat__summary-group--initiative').querySelector('button').textContent);
                } catch(error) {
                    characterData.errors.push({func: getInitiative, error});
                }
            })(characterData);

            (function getAc(characterData) {
                try {
                    characterData.ac = parseInt(charSheet.querySelector('div.ddbc-armor-class-box__value').textContent, 10);
                } catch(error) {
                    characterData.errors.push({func: getAc, error});
                }
            })(characterData);

            (function getStatsSaves(characterData) {
                try {
                    const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
                    characterData.stats = {};
                    characterData.saves = {};
                    statKeys.forEach(stat => {
                        characterData.stats[stat] = 0;
                        characterData.saves[stat] = { prof: false, val: 0 };
                    });
        
                    [...charSheet.querySelectorAll('.ddbc-ability-summary__secondary')].map(ele => parseInt(ele.textContent)).forEach((stat, index) => {
                        characterData.stats[statKeys[index]] = stat;
                    });
        
                    [...charSheet.querySelectorAll('div.ddbc-saving-throws-summary__ability-proficiency')].forEach((item, index) => {
                        characterData.saves[statKeys[index]].prof = item.children[0].getAttribute('aria-label') === 'Not Proficient' ? false : item.children[0].getAttribute('aria-label') === 'Proficient' ? true : null;
                    });
        
                    statKeys.forEach(stat => {
                        document.querySelector(`.ddbc-saving-throws-summary__ability--${stat}`).click();
                        characterData.saves[stat].val = parseInt(document.querySelector('h1.ct-sidebar__heading').children[0].children[0].children[1].textContent, 10);
                        document.querySelector('button[aria-label="Hide sidebar"]').click();
                    });
                } catch(error) {
                    characterData.errors.push({func: getStatsSaves, error});
                }
            })(characterData);

            (function getSenses(characterData) {
                try {
                    characterData.senses = {};
                    charSheet.querySelector('div.ct-senses__summary').textContent.split(',').forEach(sense => {
                        const [type, dist] = sense.trim().split(' ');
                        characterData.senses[type] = dist;
                    });
                } catch(error) {
                    characterData.errors.push({func: getSenses, error});
                }
            })(characterData);

            (function getProfs(characterData) {
                try {
                    characterData.profs = { armor: [], weapons: [], tools: [], languages: [] };
                    [...charSheet.querySelectorAll('div.ct-proficiency-groups__group')].forEach(group => {
                        const type = group.querySelector('div.ct-proficiency-groups__group-label').textContent;
                        characterData.profs[type] = group.querySelector('div.ct-proficiency-groups__group-items').textContent.split(',').filter(word => word.trim() !== '').map(word => word.trim());
                    });
                } catch(error) {
                    characterData.errors.push({func: getProfs, error});
                }
            })(characterData);

            (function getSkills(characterData) {
                try {
                    characterData.skills = {};
                    [...charSheet.querySelectorAll('div.ct-skills__item')].forEach(skill => {
                        const skillName = skill.querySelector('div.ct-skills__col--skill').textContent;
                        const skillVal = parseInt(skill.querySelector('button.integrated-dice__container').textContent, 10);
                        const skillProf = skill.children[0].children[0].getAttribute('aria-label').toLowerCase() === 'proficient' ? true : false;
                        characterData.skills[skillName] = { val: skillVal, prof: skillProf }
                    });
                } catch(error) {
                    characterData.errors.push({func: getSkills, error});
                }
            })(characterData);

            (function getDefenses(characterData) {
                try {
                    // ADD FUNCTIONALITY FOR OTHER SCREEN SIZES
                    const defEles = [...charSheet.querySelector('div.ct-combat__statuses-group.ct-combat__statuses-group--defenses').querySelectorAll('div.ct-defenses-summary__group.ct-defenses-summary__group--single')];
                    characterData.defenses = {
                        resistances: Array.from(defEles[0].querySelector('span.ct-defenses-summary__group-items').querySelectorAll('span.ct-defenses-summary__defense')).map(item => item.textContent.replace(/\*$/, '')),
                        immunities: Array.from(defEles[1].querySelector('span.ct-defenses-summary__group-items').querySelectorAll('span.ct-defenses-summary__defense')).map(item => item.textContent.replace(/\*$/, '')),
                        vulnerabilities: Array.from(defEles[2].querySelector('span.ct-defenses-summary__group-items').querySelectorAll('span.ct-defenses-summary__defense')).map(item => item.textContent.replace(/\*$/, ''))
                    }
                } catch(error) {
                    characterData.errors.push({func: getDefenses, error});
                }
            })(characterData);

            (function getConditions(characterData) {
                try {
                    // ADD FUNCTIONALITY FOR OTHER SCREEN SIZES
                    characterData.conditions = [...charSheet.querySelector('div.ct-conditions-summary').querySelectorAll('span.ddbc-condition')].map(condition => condition.textContent);
                } catch(error) {
                    characterData.errors.push({func: getConditions, error});
                }
            })(characterData);

            (function getActions(characterData) {
                try {
                    // ADD FUNCTIONALITY TO DETECT WHICH SUBSECTION BOX IS SELECT AND CLICK THROUGH AS NEEDED
                    characterData.attacksPerAction = parseInt(charSheet.querySelector('div.ct-actions__attacks-heading').textContent.split('•')[1].slice(-1), 10);
                    const actionsList = [...charSheet.querySelectorAll('div.ct-actions-list')];
                    characterData.actions = {};
                    actionsList.forEach(actionList => {
                        const actionType = actionList.children[0].textContent.split('•')[0].trim();
                        characterData.actions[actionType] = [];
                        [...actionList.children[1].children].forEach((actionListContentChild, index) => {
                            let actionTypeItem;
                            if (actionListContentChild.classList.contains('ddbc-attack-table')) {
                                try {
                                    actionTypeItem = {_type: 'attack_table', attackList: []};
                                    [...actionListContentChild.children[1].children].forEach(combatAttack => {
                                        const attack = {_type: 'attack_table_attack'};
                                        combatAttack.click();
                                        const sidebar = document.querySelector('header.ct-sidebar__header').parentElement;
                                        [...sidebar.querySelector('div.ct-action-detail__properties').children].forEach(attackProperty => {
                                            attack[attackProperty.children[0].textContent.replace(/ /g, '_')] = attackProperty.children[1].textContent;
                                            const descriptionElements = sidebar.querySelector('div.ddbc-html-content.ct-action-detail__description')?.querySelectorAll(':scope > p');
                                            if (descriptionElements) {
                                                attack.description = [...descriptionElements].map(desc => desc.textContent);
                                            }
                                        });
                                        closeSidebar();
                                        actionTypeItem.attackList.push(attack);
                                    })
                                } catch(error) {
                                    characterData.errors.push({func: getActions, actionType: 'attack_table', error});
                                }
                            }
                            else if (actionListContentChild.classList.contains('ct-actions-list__basic')) {
                                try {
                                    actionTypeItem = {_type: 'basic_action'};
                                    const basicActionsList = [...actionListContentChild.querySelector('div.ct-basic-actions').querySelectorAll(':scope > span')];
                                    basicActionsList.forEach(basicAction => {
                                        basicAction.click();
                                        const sidebar = document.querySelector('header.ct-sidebar__header').parentElement;
                                        const actionName = sidebar.querySelector('header.ct-sidebar__header').textContent;
                                        const actionDescription = [...sidebar.querySelector('div.ddbc-html-content').querySelectorAll(':scope > p')].map(p => p.textContent);
                                        actionTypeItem[actionName] = actionDescription;
                                        closeSidebar();
                                    })
                                } catch(error) {
                                    characterData.errors.push({func: getActions, actionType: 'basic_action', error});
                                }
                            }
                            else if (actionListContentChild.classList.contains('ct-actions-list__activatable')) {
                                try {
                                    actionTypeItem = {_type: 'activatable_action'};
                                    actionTypeItem.name = actionListContentChild.querySelector('div.ct-feature-snippet__heading ').textContent;
                                    actionTypeItem.description = [...actionListContentChild.querySelector('div.ct-feature-snippet__content').querySelectorAll(':scope p')].map(pElement => pElement.textContent);
                                    let maxCharges, curCharges, resetOn;
                                    if (actionListContentChild.querySelector('div.ct-slot-manager')) {
                                        maxCharges = [...actionListContentChild.querySelector('div.ct-slot-manager').children].filter(ele => ele.classList.contains('ct-slot-manager__slot')).length;
                                        curCharges = maxCharges - [...actionListContentChild.querySelector('div.ct-slot-manager').children].filter(ele => ele.classList.contains('ct-slot-manager__slot') && ele.getAttribute('aria-checked') === true).length;
                                    } 
                                    else if (actionListContentChild.querySelector('div.ct-feature-snippet__limited-use-usages')?.textContent) {
                                        maxCharges = actionListContentChild.querySelector('div.ct-feature-snippet__limited-use-usages').textContent;
                                        curCharges = actionListContentChild.querySelector('.ct-slot-manager-large__value.ct-slot-manager-large__value--cur').textContent;
                                    }
                                    resetOn = actionListContentChild.querySelector('div.ct-feature-snippet__limited-use-reset')?.textContent;
                                    if (maxCharges) actionTypeItem.maxCharges = maxCharges;
                                    if (curCharges) actionTypeItem.curCharges = curCharges;
                                    if (resetOn) actionTypeItem.resetOn = resetOn;
                                } catch(error) {
                                    characterData.errors.push({func: getActions, actionType: 'actions-activatable_action', actionTypeItem: actionListContentChild.querySelector('div.ct-feature-snippet__heading ').textContent, error});
                                }
                            }
                            else {
                                const basicActions = characterData.actions[actionType][index] = actionListContentChild;
                            }
                            characterData.actions[actionType].push(actionTypeItem);
                        })
                        ;
                    });
                } catch(error) {
                    characterData.errors.push({func: getActions, error});
                }
            })(characterData);

            function clearErrors(characterData, triesLeft) {
                if (triesLeft === 0) {
                    console.log(characterData);
                    const msg = {
                        action: 'notification',
                        type: 'error',
                        data: `characterData failed to resolve errors: ${JSON.stringify(characterData.errors)}`
                    };
                    browserAPI.runtime.sendMessage(msg);
                    return;
                }

                const funcs = [...new Set(characterData.errors.map(error => error.func))];

                characterData.errors = [];

                funcs.forEach(func => func(characterData));
            
                if (characterData.errors.length) {
                    return setTimeout(() => clearErrors(characterData, triesLeft - 1), retryDelay);
                } else {
                    console.log(characterData);
                    const msg = {
                        action: 'storeData',
                        type: 'ddb_scraped',
                        data: characterData
                    };
                    browserAPI.runtime.sendMessage(msg);
                    return;
                }
            }            
            
            clearErrors(characterData, 3);

        } else if (retriesLeft > 0) {
            console.log('Element not found, retrying...');
            setTimeout(() => tryScraping(retriesLeft - 1), retryDelay);
        } else {
            console.error('Failed to find the element after max retries.');
        }
    }

    setTimeout(() => tryScraping(maxRetries), retryDelay);
}

// Listen for messages from the background or content script
browserAPI.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'scrapeDNDBeyond' && message.type === 'begin') {

        // Call the scrapeCharacterData function to start the scraping process
        scrapeCharacterData();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const msg = { 
        action: 'notification',
        type: 'ddb_ContentLoaded'
    }
    console.log('sending msg: ', JSON.stringify(msg));
    browserAPI.runtime.sendMessage(msg);
});
