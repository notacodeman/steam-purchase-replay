// What Steam licenses and store bundles contain when their names don't say so. This file is the built-in copy: the
// live site replaces it with the list kept in the admin page (/admin.html, stored in D1 and served by
// /api/known-data), and a downloaded report carries whichever list was in use when it was saved. The admin page can
// download the current list in this same format to refresh this file.
//
// KNOWN_PACKAGES: [license names as they appear on the licenses page, games they give]. Used to work out where each
// game on the games page came from (neverPlayedBySource in analyze-playtime.js). Case, punctuation, trademark signs
// and region tags are ignored, so "Half-Life 1 Anthology" also matches "HALF-LIFE 1 ANTHOLOGY (RoW)". Covers
//  - packs and bundles that give several games (The Orange Box, id's collections, Humble Bundles),
//  - games whose license has a different name (Kingdom Launch → Kingdom: Classic, H1Z1 → Z1 Battle Royale),
//  - remasters and new versions Steam hands to owners of the original (BioShock → BioShock Remastered).
// Licenses named after their game plus an edition ("Control Standard Edition") are matched without being listed here.
// Entries that give one game also tie purchases and keys under the old name to it (makeNameMatcher in util.js), so the
// game's price and playtime line up: MW2 bought on Steam or as a key is played as "Call of Duty".
//
// KNOWN_BUNDLES: bundles sold as separate keys (Humble Choice months, store bundles), and free key giveaways. When two
// or more of a visitor's unlinked key activations are games from a bundle, activated within 30 days of each other,
// it's suggested as the purchase they came from (bundleSuggestions in purchases.js). date is when it went on sale;
// only keys activated from then on count. price is null when unknown. kind is 'bundle', 'sub' (a subscription month)
// or 'giveaway': a game given away free for a while, where ends is the last day. One unlinked key of that game
// activated between the day before date and the day after ends is enough to suggest it as a free giveaway. Editing an
// unlinked key also lists the bundles, giveaways and packs its game is in (keySourceHints in purchases.js).
//
// FREE_TO_PLAY: games anyone can add for free. When one has no license of its own it's counted as free.

const KNOWN_PACKAGES = [
  // ---------- Valve ----------
  [['The Orange Box'], ['Half-Life 2', 'Half-Life 2: Deathmatch', 'Half-Life 2: Episode One', 'Half-Life 2: Episode Two',
    'Half-Life 2: Lost Coast', 'Portal', 'Team Fortress 2']],
  [['Half-Life 1 Anthology'], ['Half-Life', 'Half-Life: Opposing Force', 'Half-Life: Blue Shift', 'Team Fortress Classic']],
  [['Half-Life 1: Source'], ['Half-Life: Source', 'Half-Life Deathmatch: Source']],
  [['Counter-Strike 1 Anthology'], ['Counter-Strike', 'Counter-Strike: Condition Zero', 'Day of Defeat', 'Deathmatch Classic',
    'Ricochet']],
  [['Valve Complete Pack'], ['Half-Life', 'Half-Life: Opposing Force', 'Half-Life: Blue Shift', 'Team Fortress Classic',
    'Deathmatch Classic', 'Ricochet', 'Day of Defeat', 'Counter-Strike', 'Counter-Strike: Condition Zero', 'Half-Life: Source',
    'Half-Life Deathmatch: Source', 'Half-Life 2', 'Half-Life 2: Lost Coast', 'Half-Life 2: Deathmatch',
    'Half-Life 2: Episode One', 'Half-Life 2: Episode Two', 'Portal', 'Team Fortress 2', 'Counter-Strike: Source',
    'Day of Defeat: Source', 'Left 4 Dead', 'Left 4 Dead 2', 'Portal 2']],
  [['Half-Life Complete'], ['Half-Life', 'Half-Life: Opposing Force', 'Half-Life: Blue Shift', 'Half-Life 2',
    'Half-Life 2: Episode One', 'Half-Life 2: Episode Two']],
  [['Counter-Strike: Global Offensive'], ['Counter-Strike 2']],
  [['Half-Life 2'], ['Half-Life 2', 'Half-Life 2: Lost Coast']],
  [['Counter-Strike: Condition Zero'], ['Counter-Strike: Condition Zero', 'Counter-Strike: Condition Zero Deleted Scenes']],

  // ---------- id Software ----------
  [['Quake Collection', 'Quake 2007 Collection'], ['Quake', 'Quake Mission Pack 1: Scourge of Armagon',
    'Quake Mission Pack 2: Dissolution of Eternity', 'Quake II', 'Quake II: The Reckoning', 'Quake II: Ground Zero',
    'Quake III Arena', 'Quake III: Team Arena']],
  // DOOM + DOOM II (2024) was added free for everyone who owned DOOM or DOOM II
  [['Doom Classic Complete', 'Doom Classic Complete 2012'], ['Ultimate Doom', 'DOOM II', 'Master Levels for DOOM II',
    'Final DOOM', 'DOOM + DOOM II']],
  [['Wolf Pack'], ['Wolfenstein 3D', 'Wolfenstein 3D: Spear of Destiny', 'Return to Castle Wolfenstein']],
  [['id Super Pack'], ['Wolfenstein 3D', 'Wolfenstein 3D: Spear of Destiny', 'Return to Castle Wolfenstein', 'Ultimate Doom',
    'DOOM II', 'Master Levels for DOOM II', 'Final DOOM', 'DOOM 3', 'DOOM 3 Resurrection of Evil', 'Quake',
    'Quake Mission Pack 1: Scourge of Armagon', 'Quake Mission Pack 2: Dissolution of Eternity', 'Quake II',
    'Quake II: The Reckoning', 'Quake II: Ground Zero', 'Quake III Arena', 'Quake III: Team Arena', 'Quake 4']],

  // ---------- other publisher packs ----------
  [['Introversion Complete Pack'], ['Uplink', 'Darwinia', 'DEFCON', 'Multiwinia']],
  [['Unreal Deal', 'Unreal Deal Pack'], ['Unreal Gold', 'Unreal II: The Awakening', 'Unreal Tournament: Game of the Year Edition',
    'Unreal Tournament 2004', 'Unreal Tournament 3: Black Edition']],
  [['Peggle Complete Pack'], ['Peggle Deluxe', 'Peggle Nights', 'Peggle Extreme']],
  [['Hitman Collection'], ['Hitman: Codename 47', 'Hitman 2: Silent Assassin', 'Hitman: Contracts', 'Hitman: Blood Money']],
  [['Just Cause Bundle'], ['Just Cause', 'Just Cause 2']],
  [['Crysis Maximum Edition Bundle'], ['Crysis', 'Crysis Warhead', 'Crysis 2 Maximum Edition']],
  [['FEAR Complete Pack'], ['F.E.A.R.', 'F.E.A.R.: Extraction Point', 'F.E.A.R.: Perseus Mandate', 'F.E.A.R. 2: Project Origin']],
  [['Mass Effect Collection'], ['Mass Effect (2007)', 'Mass Effect 2 (2010)', 'Mass Effect 2 (2010) Edition']],
  [['Metro Redux Bundle'], ['Metro 2033 Redux', 'Metro: Last Light Redux']],
  [['Still Life Collection'], ['Still Life', 'Still Life 2', 'Post Mortem']],
  [['Codemasters Bundle 1', 'Codemasters Bundle 2'], ['Overlord', 'Overlord: Raising Hell', 'Overlord II',
    'Rise of the Argonauts', 'Operation Flashpoint: Dragon Rising', 'Operation Flashpoint: Red River']],
  [['Arma II: Combined Operations'], ['Arma 2', 'Arma 2: Operation Arrowhead']],
  [['Shadowrun Triple Pack'], ['Shadowrun Returns', "Shadowrun: Dragonfall - Director's Cut",
    'Shadowrun: Hong Kong - Extended Edition']],
  [['Resident Evil Deluxe Origins Bundle / Biohazard Deluxe Origins Bundle'], ['Resident Evil', 'Resident Evil 0']],
  [['Dawn of War Franchise Pack'], ['Warhammer 40,000: Dawn of War - Anniversary Edition',
    'Warhammer 40,000: Dawn of War - Winter Assault', 'Warhammer 40,000: Dawn of War - Dark Crusade',
    'Warhammer 40,000: Dawn of War - Soulstorm', 'Warhammer 40,000: Dawn of War II - Anniversary Edition',
    'Warhammer 40,000: Dawn of War II - Chaos Rising', 'Warhammer 40,000: Dawn of War II - Retribution']],
  [['Warhammer 40,000: Dawn of War - Game of the Year Edition'], ['Warhammer 40,000: Dawn of War - Anniversary Edition',
    'Warhammer 40,000: Dawn of War - Winter Assault']],
  [['THQ Collection (Summer 2012)'], ['S.T.A.L.K.E.R.: Shadow of Chernobyl',
    'S.T.A.L.K.E.R.: Shadow of Chornobyl - Enhanced Edition', 'Titan Quest', 'Titan Quest: Immortal Throne',
    'Titan Quest Anniversary Edition',
    'Company of Heroes - Legacy Edition', 'Company of Heroes: Opposing Fronts',
    'Warhammer 40,000: Dawn of War II - Anniversary Edition', 'Warhammer 40,000: Dawn of War II - Chaos Rising',
    'Warhammer 40,000: Dawn of War II - Retribution', 'Warhammer 40,000: Space Marine - Anniversary Edition', 'Metro 2033',
    'Darksiders', 'Darksiders Warmastered Edition', 'Homefront', 'Saints Row: The Third', 'Nexuiz']],
  [['THQ Humble Bundle Core - Nov 2012'], ['Darksiders', 'Darksiders Warmastered Edition', 'Company of Heroes - Legacy Edition',
    'Company of Heroes: Opposing Fronts', 'Company of Heroes: Tales of Valor', 'Metro 2033', 'Red Faction: Armageddon']],
  [['Sam and Max: Season One'], ['Sam & Max 101: Culture Shock', 'Sam & Max 102: Situation: Comedy',
    'Sam & Max 103: The Mole, the Mob and the Meatball', 'Sam & Max 104: Abe Lincoln Must Die!', 'Sam & Max 105: Reality 2.0',
    'Sam & Max 106: Bright Side of the Moon']],
  [['Sam and Max: Season Two'], ['Sam & Max 201: Ice Station Santa', 'Sam & Max 202: Moai Better Blues',
    'Sam & Max 203: Night of the Raving Dead', 'Sam & Max 204: Chariots of the Dogs', "Sam & Max 205: What's New Beelzebub?"]],
  [['Bone Complete Bundle'], ['Bone: Out from Boneville', 'Bone: The Great Cow Race']],
  [['Serious Sam HD'], ['Serious Sam HD: The First Encounter', 'Serious Sam Classic: The First Encounter',
    'Serious Sam Classics: Revolution', 'Serious Sam Fusion 2017 (beta)']],
  [['Serious Sam HD: SE'], ['Serious Sam HD: The Second Encounter', 'Serious Sam Classic: The Second Encounter',
    'Serious Sam Classics: Revolution', 'Serious Sam Fusion 2017 (beta)']],
  [['Serious Sam 3 Deluxe'], ['Serious Sam 3: BFE']],
  [['Serious Sam Double D Comp'], ['Serious Sam Double D XXL']],
  [['Cthulhu Saves the World & Breath of Death VII Double Pack'], ['Cthulhu Saves the World', 'Breath of Death VII']],
  [['Deponia: The Complete Journey'], ['Deponia', 'Chaos on Deponia', 'Goodbye Deponia']],
  [['The Incredible Adventures of Van Helsing Anthology'], ['Deathtrap', 'The Incredible Adventures of Van Helsing',
    'The Incredible Adventures of Van Helsing II', 'The Incredible Adventures of Van Helsing III']],
  [['The Daedalic Armageddon Bundle', 'Armageddon Bundle'], ['Deponia', 'Chaos on Deponia', 'Goodbye Deponia',
    'The Whispered World Special Edition', 'The Dark Eye: Chains of Satinav', 'A New Beginning - Final Cut', 'Memoria',
    'The Night of the Rabbit', 'Edna & Harvey: The Breakout', "Edna & Harvey: Harvey's New Eyes", '1954 Alcatraz']],
  [['Developer Alliance Bundle'], ['Polarity', 'BEEP', 'Camera Obscura', 'Out There Somewhere']],
  [['Celebrat10n TrackMania2 Pack'], ['TrackMania² Canyon', 'TrackMania² Stadium', 'TrackMania² Valley']],
  [['A Valley Without Wind 1 & 2'], ['A Valley Without Wind', 'A Valley Without Wind 2']],
  [['Strike Suit Zero Mega Bundle'], ['Strike Suit Zero', 'Strike Suit Infinity']],
  [['The eXceed Collection'], ['eXceed - Gun Bullet Children', 'eXceed 2nd - Vampire REX',
    'eXceed 3rd - Jade Penetrate Black Package']],
  [['The Moon Sliver + The Music Machine'], ['The Moon Sliver', 'The Music Machine']],
  [['Titan Quest Anniversary + Ragnarok'], ['Titan Quest Anniversary Edition']],
  [['Rising Storm', 'Red Orchestra 2'], ['Rising Storm/Red Orchestra 2 Multiplayer']],
  [['Red Orchestra'], ['Red Orchestra: Ostfront 41-45']],

  // ---------- Humble Bundles ----------
  // Humble Weekly Sale: Telltale Games, May 2013
  [['Telltale Games'], ['Sam & Max 301: The Penal Zone', 'Sam & Max 302: The Tomb of Sammun-Mak',
    "Sam & Max 303: They Stole Max's Brain!", 'Sam & Max 304: Beyond the Alley of the Dolls',
    'Sam & Max 305: The City that Dares not Sleep', "Back to the Future: Ep 1 - It's About Time",
    'Back to the Future: Ep 2 - Get Tannen!', 'Back to the Future: Ep 3 - Citizen Brown',
    'Back to the Future: Ep 4 - Double Visions', 'Back to the Future: Ep 5 - OUTATIME', 'Puzzle Agent', 'Puzzle Agent 2',
    'Hector: Ep 1', 'Hector: Ep 2', 'Hector: Ep 3', 'Wallace & Gromit Ep 1: Fright of the Bumblebees',
    'Poker Night at the Inventory (2010 Original Version)', 'Jurassic Park: The Game']],
  [['Humble Indie Bundle 2'], ['Braid', 'Cortex Command', 'Machinarium', 'Osmos', 'Revenge of the Titans']],
  [['Humble Indie Bundle 3'], ['Crayon Physics Deluxe', 'Cogs', 'VVVVVV', 'Hammerfight', 'And Yet It Moves',
    'Atom Zombie Smasher', 'Steel Storm: Burning Retribution']],
  [['Humble Indie Bundle 4'], ['Super Meat Boy', 'Jamestown', 'NightSky', 'Shank', 'BIT.TRIP RUNNER', 'VVVVVV',
    'Crayon Physics Deluxe', 'Hammerfight', 'And Yet It Moves', 'Cogs']],
  [['Humble Indie Bundle 4 BTA'], ['Cave Story+', 'Gratuitous Space Battles']],
  [['Humble Indie Bundle 5'], ['Amnesia: The Dark Descent', 'Bastion', 'Psychonauts', 'Superbrothers: Sword & Sworcery EP',
    'LIMBO', 'Braid', "Lone Survivor: The Director's Cut", 'Super Meat Boy']],
  [['Oil Rush Bundle'], ['Oil Rush']],

  // ---------- renamed games and differently named licenses ----------
  [['Kingdom Launch'], ['Kingdom: Classic']],
  [['H1Z1'], ['Z1 Battle Royale', 'H1Z1: Test Server']],
  [["PLAYERUNKNOWN'S BATTLEGROUNDS", "PLAYERUNKNOWN'S BATTLEGROUNDS - Worldwide Package"], ['PUBG: BATTLEGROUNDS']],
  [['Grand Theft Auto V'], ['Grand Theft Auto V Legacy', 'Grand Theft Auto V Enhanced']],
  // GTA IV's own app became The Complete Edition in 2020; owners of either got it
  [['Grand Theft Auto IV', 'Grand Theft Auto: Episodes from Liberty City'],
    ['Grand Theft Auto IV: The Complete Edition']],
  [['Battlefield REDSEC'], ['Battlefield 6']],
  [['Battlefield 1 Revolution'], ['Battlefield 1']],
  // MW2's app (1938090) became the Call of Duty launcher; its playtime covers everything played through it
  [['Call of Duty: Warzone', 'Call of Duty: Modern Warfare II'], ['Call of Duty']],
  [['TABG'], ['Totally Accurate Battlegrounds']],
  [['RecRoom'], ['Rec Room']],
  [['Tom Raider GOL'], ['Lara Croft and the Guardian of Light']],
  [['AAAaAAAAA!!! for the Awesome'], ['AaaaaAAaaaAAAaaAAAAaAAAAA!!! for the Awesome']],
  [['Natural Selection II'], ['Natural Selection 2']],
  [['CannonGuns of Icarus Online Collectors Edition'], ['Guns of Icarus Online']],
  [['Summer Sale Prize - Alien Breed 2'], ['Alien Breed 2: Assault']],
  [['R.U.S.E.'], ['R.U.S.E']],
  [['E.Y.E.: Divine Cybermancy'], ['E.Y.E: Divine Cybermancy']],
  [['Plants vs. Zombies'], ['Plants vs. Zombies: Game of the Year']],
  [['Medal of Honor Standard WW'], ['Medal of Honor(TM) Single Player', 'Medal of Honor(TM) Multiplayer']],
  [['Trine 2 CE + Goblin Menace'], ['Trine 2']],
  [['Orcs Must Die + Artifacts of Power and Lost Adventures'], ['Orcs Must Die!']],
  [['Eon Altar: Episode 1'], ['Eon Altar']],
  [['Toy Odyssey'], ['ToyOdyssey']],
  [['Pyre Gift Copy - Hades Purchase'], ['Pyre']],
  [['SYNTHETIK: Legion Rising'], ['SYNTHETIK']],
  [['Metal Gear Rising'], ['METAL GEAR RISING: REVENGEANCE']],
  [['Stubbs the Zombie'], ['Stubbs the Zombie in Rebel Without a Pulse']],
  [['SiN'], ['SiN Gold']],
  [['Tiny and Big: Grandpa\'s Leftovers Soundtrack Edition'], ["Tiny and Big: Grandpa's Leftovers"]],
  [['Thief II'], ['Thief II: The Metal Age']],
  [['Backyard Baseball'], ["Backyard Baseball '97"]],
  [['Sonic and Sega All Star Racing'], ['Sonic and SEGA All Stars Racing']],
  [['Sonic the Hedgehog 4 - EP 1'], ['SONIC THE HEDGEHOG 4 Episode I']],
  [['Sonic 4 - Episode 2'], ['SONIC THE HEDGEHOG 4 Episode II']],
  [['FEZ Soundtrack Edition'], ['FEZ']],
  [['The Binding Of Isaac with Wrath of the Lamb DLC'], ['The Binding of Isaac']],
  [['Bad Rats: the Rats Revenge'], ['Bad Rats']],
  [['GoNNER - Press Jump To Die Edition'], ['GoNNER']],
  [['Homestuck Pesterquest'], ['Pesterquest']],
  [['Arizona Sunshine'], ['Arizona Sunshine VR Legacy']],
  [['Sonic Adventures DX'], ['Sonic Adventure DX']],
  [['LEGO Batman'], ['LEGO Batman: The Videogame']],
  [['LEGO Batman 2'], ['LEGO Batman 2: DC Super Heroes']],
  [['Lego Star Wars Saga'], ['LEGO Star Wars: The Complete Saga']],
  [['Lego Star Wars 3: The Clone Wars'], ['LEGO Star Wars III: The Clone Wars']],
  [['LEGO Lord of the Rings'], ['LEGO The Lord of the Rings']],
  [['Jedi Outcast Comp'], ['STAR WARS Jedi Knight II: Jedi Outcast']],
  [['Star Wars Starfighter Comp'], ['STAR WARS Starfighter']],
  [['Star Wars: Empire at War Comp'], ['STAR WARS Empire at War: Gold Pack']],
  [['Star Wars - The Force Unleashed'], ['STAR WARS: The Force Unleashed Ultimate Sith Edition']],
  [['Star Wars The Force Unleashed II Comp'], ['STAR WARS: The Force Unleashed II']],
  [['Star Wars: Knights of the Old Republic 2 Comp'], ['STAR WARS Knights of the Old Republic II: The Sith Lords']],
  [['Star Wars - Rebel Assault 1 and 2'], ['STAR WARS: Rebel Assault I + II']],
  [['STAR WARS X-Wing vs TIE Fighter + Balance of Power'], ['STAR WARS X-Wing vs TIE Fighter: Balance of Power Campaigns']],
  [['STAR WARS Battlefront II (Classic, 2005)'], ['Star Wars: Battlefront 2 (Classic, 2005)']],
  [['Holiday Sale 2011 Gift: Garshasp The Monster Slayer'], ['Garshasp: The Monster Slayer']],
  [['Infestation Free Steam Access'], ['Infestation: The New Beginning']],
  [['Wreckfest Sneak Peek 2.0'], ['Wreckfest', 'Wreckfest Throw-A-Santa + Sneak Peek 2.0']],
  [['Prison Architect Introversioner'], ['Prison Architect']],
  [['Mad Max Pre-Order'], ['Mad Max']],
  [['Lost Planet 3 Digital Distribution'], ['Lost Planet 3']],
  [['Resident Evil 4 WW Digital Distribution'], ['Resident Evil 4 (2005)']],
  [['Strider Digital Distribution'], ['Strider']],
  [['Resident Evil / Biohazard Revelations 2 Deluxe Edition'], ['Resident Evil Revelations 2']],
  [['HITMAN: THE COMPLETE FIRST SEASON [Prologue + Episode 1-6 + Bonus Episode]'], ['HITMAN']],
  [['The Elder Scrolls Online: Tamriel Unlimited Humble Monthly'], ['The Elder Scrolls Online']],
  [['Hiveswap Friendsim Complete'], ['Hiveswap Friendsim']],
  [['I am not a Monster'], ['I’m not a Monster']],
  [['The Haunted Island, a Frog Detective Game'], ['Frog Detective 1: The Haunted Island']],
  [['Garage'], ['GARAGE: Bad Trip']],
  [['WARSAW'], ['WARSAW RISING: City of Heroes']],
  [['Textorcist'], ['The Textorcist: The Story of Ray Bibbia']],
  [['The Swords of Ditto'], ["The Swords of Ditto: Mormo's Curse"]],
  [['Disco Elysium - The Final Cut'], ['Disco Elysium']],
  [['Deadlock - Beta Testing'], ['Deadlock']],
  [['Rogue Monster Rush for Beta Testing'], ['Rogue Monster Rush']],
  [['Intruder for Beta Testing'], ['Intruder']],
  [['Consortium'], ['CONSORTIUM 2014', 'CONSORTIUM Remastered']],

  [['Poker Night'], ['Poker Night at the Inventory (2010 Original Version)']],
  [['Jurassic Park'], ['Jurassic Park: The Game']],
  [['The Walking Dead Season 2'], ['The Walking Dead: Season Two']],
  [['Serious Sam Random Encounter Comp'], ['Serious Sam: The Random Encounter']],
  [['Alan Wake CE'], ['Alan Wake']],
  [['Hero Academy - Gold Pack'], ['Hero Academy']],
  [['Rocketbirds'], ['Rocketbirds: Hardboiled Chicken']],
  [['Alien Rage'], ['Alien Rage - Unlimited']],
  [['Bit Trip Runner 2'], ['BIT.TRIP Presents... Runner2: Future Legend of Rhythm Alien']],
  [["Don't Starve", "Don't Starve + Reign of Giants DLC"], ["Don't Starve", "Don't Starve Together"]],
  [['POSTAL 2 + Paradise Lost'], ['POSTAL 2']],
  [['POSTAL 1'], ['POSTAL']],
  [['Trackmania Stadium'], ['TrackMania² Stadium']],
  [['Amnesia: Machine for Pigs'], ['Amnesia: A Machine for Pigs']],
  [['Invisible, Inc. + Contingency Plan Bundle'], ['Invisible, Inc.']],
  [['Skullgirls Pre-Purchase'], ['Skullgirls 2nd Encore']],
  [['Rust Alpha'], ['Rust']],
  [['Qbeh-1'], ['Qbeh-1: The Atlas Cube']],
  [['Cities: Skylines and After Dark'], ['Cities: Skylines']],
  [['SatelliteReign Deluxe Edition'], ['Satellite Reign']],
  [['Interplanetary: Enhanced Edition'], ['Interplanetary']],
  [['Splatter'], ['Splatter - Zombiecalypse Now']],
  [['Selfie'], ['Selfie: Sisters of the Amniotic Lens']],
  [['The Old City'], ['The Old City: Leviathan']],
  [["Pajama Sam: No Need to Hide When It's Dark Outside"], ["Pajama Sam in No Need to Hide When It's Dark Outside"]],
  [['Vox Populi Vox Dei(a werewolf thriller): Episode 2'], ['Vox Populi Vox Dei 2']],
  [['AER'], ['AER Memories of Old']],
  [['Fortified - Free Until June 8 at 11am Pacific'], ['Fortified']],
  [['Stories: Path of Destinies'], ['Stories: The Path of Destinies']],
  [['Passpartout'], ['Passpartout: The Starving Artist']],
  [['Throne of Lies'], ['Throne of Lies®: Medieval Politics']],
  [['Super Seducer 2'], ['Super Seducer 2 : Advanced Seduction Tactics']],
  [['Conan Exiles Enhanced - Standard Edition'], ['Conan Exiles', 'Conan Exiles - Public Beta Client']],
  [['RESIDENT EVIL 7 Gold Edition'], ['Resident Evil 7 Biohazard']],
  [['Resident Evil Village Gold Edition'], ['Resident Evil Village', 'Resident Evil Re:Verse']],
  [['ELDEN RING Americas Retail pre-order'], ['ELDEN RING']],
  [["TMNT: Shredder's Revenge - Ultimate Edition"], ["Teenage Mutant Ninja Turtles: Shredder's Revenge"]],
  [['Paper Beast'], ['Paper Beast - Folded Edition']],
  [['Savant - Ascent'], ['Savant - Ascent REMIX']],
  [['边境开拓者'], ['Border Pioneer']],
  [['Indivisible - WW'], ['Indivisible']],
  [['Bioshock Infinite + Season Pass Bundle'], ['BioShock Infinite']],
  [['Penumbra: Black Plague - Gold Edition'], ['Penumbra: Black Plague', 'Penumbra: Requiem']],
  [['Dark Souls'], ['DARK SOULS: Prepare To Die Edition']],
  [['Saints Row IV Game of the Century Edition'], ['Saints Row IV']],

  // ---------- remasters and new versions given to owners of the original ----------
  [['Bioshock'], ['BioShock Remastered']],
  [['Bioshock 2'], ['BioShock 2 Remastered']],
  [['Borderlands GOTY'], ['Borderlands GOTY Enhanced']],
  [['Elder Scrolls V: Skyrim Legendary', 'The Elder Scrolls V: Skyrim Special Edition Upgrade'],
    ['The Elder Scrolls V: Skyrim Special Edition']],
  [['Dear Esther'], ['Dear Esther: Landmark Edition']],
  [['Little Nightmares'], ['Little Nightmares Enhanced Edition']],
  [['System Shock 2'], ['System Shock 2 (1999)', 'System Shock 2: 25th Anniversary Remaster']],
  [['Darksiders'], ['Darksiders Warmastered Edition']],
  [['Hard Reset Extended edition'], ['Hard Reset', 'Hard Reset Redux']],
  [["Hellblade: Senua's Sacrifice"], ["Hellblade: Senua's Sacrifice VR Edition"]],
  [['SUPERHOT'], ['SUPERHOT: MIND CONTROL DELETE']],
  [['BloodRayne'], ['BloodRayne: Terminal Cut']],
  [['BloodRayne 2'], ['BloodRayne 2: Terminal Cut']],
  [['Nongünz'], ['Nongünz', 'Nongunz: Doppelganger Edition']],
  [['Red Faction Guerrilla Re-Mars-tered'], ['Red Faction Guerrilla Re-Mars-tered',
    'Red Faction: Guerrilla Steam Edition']],
  // the Enhanced Editions (2025) were given to owners of the originals
  [['S.T.A.L.K.E.R.: Shadow of Chernobyl'], ['S.T.A.L.K.E.R.: Shadow of Chernobyl',
    'S.T.A.L.K.E.R.: Shadow of Chornobyl - Enhanced Edition']],
  [['S.T.A.L.K.E.R.: Clear Sky'], ['S.T.A.L.K.E.R.: Clear Sky', 'S.T.A.L.K.E.R.: Clear Sky - Enhanced Edition']],
  [['S.T.A.L.K.E.R.: Call of Pripyat'], ['S.T.A.L.K.E.R.: Call of Pripyat',
    'S.T.A.L.K.E.R.: Call of Prypiat - Enhanced Edition']],
  [['Titan Quest', 'Titan Quest: Immortal Throne', 'Titan Quest Gold'], ['Titan Quest Anniversary Edition']],
  [['Mafia II', 'Mafia II Digital Deluxe Edition'], ['Mafia II (Classic)', 'Mafia II: Definitive Edition']],
  [['Mafia III'], ['Mafia III: Definitive Edition']],
  // Deathinitive was free for owners of the Season Pass or the franchise pack, not the base game alone
  [['Darksiders II Season Pass'], ['Darksiders II Deathinitive Edition']],
  [['Darksiders Franchise Pack'], ['Darksiders', 'Darksiders Warmastered Edition', 'Darksiders II',
    'Darksiders II Deathinitive Edition']],
  [['Company of Heroes'], ['Company of Heroes', 'Company of Heroes - Legacy Edition']],
  [['Heretic: Shadow of the Serpent Riders', 'Hexen: Beyond Heretic', 'Hexen: Deathkings of the Dark Citadel'],
    ['Heretic + Hexen']],

  // ---------- games that come with another one ----------
  [['SpeedRunners'], ['SpeedRunners', 'No Time To Explain Remastered']],
  // the original was delisted in May 2026 and appears in Spacer's Choice owners' libraries with no license of its own
  [["The Outer Worlds: Spacer's Choice Edition"], ["The Outer Worlds: Spacer's Choice Edition", 'The Outer Worlds']],
  // SEGA's Make War Not Love 3 promotion, Feb 2016
  [['Make War Not Love 3 - Prize 1'], ['Hell Yeah!', 'Hell Yeah! Wrath of the Dead Rabbit']],
  [['Shadow Warrior', 'Shadow Warrior: Special Edition'], ['Shadow Warrior', 'Viscera Cleanup Detail: Shadow Warrior']],
  [['Resident Evil 3'], ['Resident Evil 3', 'Resident Evil Resistance']],
  [['ARK: Survival Evolved'], ['ARK: Survival Evolved', 'ARK: Survival Of The Fittest']],
  // SEGA made its single Genesis games part of SEGA Mega Drive & Genesis Classics in 2018; owning one gives the hub
  [['Streets of Rage', 'Streets of Rage 2', 'Streets of Rage 3', 'Golden Axe', 'Golden Axe II', 'Golden Axe III',
    'Sonic the Hedgehog', 'Sonic the Hedgehog 2', 'Sonic 3D Blast', 'Sonic Spinball', 'Gunstar Heroes', 'Altered Beast',
    'Ecco the Dolphin', 'Comix Zone', 'Shinobi III: Return of the Ninja Master', 'Vectorman',
    "Dr. Robotnik's Mean Bean Machine", 'Phantasy Star II', 'Phantasy Star III: Generations of Doom', 'Phantasy Star IV'],
    ['SEGA Mega Drive & Genesis Classics']],
];

// Only Steam keys are listed: Humble Originals (DRM-free) and Uplay/Origin keys are left out.
const KNOWN_BUNDLES = [
  { name: 'Humble Yogscast Jingle Jam 2017', store: 'Humble Bundle', kind: 'bundle', date: '2017-12-01', price: 35, games: [
    'All-Star Fruit Racing - Yogscast Exclusive DLC', 'Ancient Planet Tower Defense', 'Auto Age: Standoff',
    'Back to Bed', 'Battle Riders', 'Battlerite DLC: YogYog Bear Mount', 'Bezier', 'Blockstorm', 'Bomb Defense',
    'Caveblazers - Arena Mode', 'Chainsaw Warrior', 'Chime Sharp', 'Chivalry: Medieval Warfare', 'Chronology',
    'Cities: Skylines - Snowfall', 'ClusterPuck 99', 'Cosmonautica', 'Crusaders of the Lost Idols: Elite Starter Pack',
    'Deep Dungeons of Doom', 'Defend Your Life: TD', 'Dimension Jump', 'Distrust: Polar Survival', 'Dreaming Sarah',
    'Dungeon of the Endless', 'F.E.X (Forced Evolution Experiment)', 'Figment - Soundtrack', 'Filthy, Stinking, Orcs!',
    'FreeCell Quest', 'Gangs of Space', "Garry's Mod", 'Guild Wars 2: Heroic Edition', 'Gunpoint',
    'Guns of Icarus Alliance', 'Gurgamoth', 'Headlander', 'Idle Champions - Celeste Starter Pack',
    'Intelligent Design: An Evolutionary Sandbox', 'Lion Quest', 'LostWinds', 'Master Spy', 'Mimic Arena',
    'Mirage: Arcane Warfare', 'NASCAR Heat 2 - October Jumbo Expansion', 'Offensive Combat: Redux!', 'On Rusty Trails',
    'Painters Guild', 'Psychonauts', "Q.U.B.E: Director's Cut", 'ReThink', 'Robocraft - Exclusive Jingle Jam Pack',
    'Rust', 'Sanctum 2', 'Scanner Sombre', 'Scrap Garden', 'Spectrum', 'SuperLuminauts',
    'Tales from Candlekeep: Tomb of Annihilation', 'Team Racing League', 'Teslagrad', 'The Fall', 'The Inner World',
    'Tiltagon', 'Toy Odyssey: The Lost and Found', 'Train Valley', 'War for the Overworld - Yogscast Worker Skin',
    'Warhammer: End Times - Vermintide: Dwarf Helmet', 'Wasted Pizza', 'Zero Reflex: Black Eye Edition'] },
  // Humble Monthly (November 2015 to December 2019), Steam keys only, checked against gg.deals and barter.vg.
  // date is the first Friday of the month before, when that month's early unlocks went out; the rest followed on the
  // first Friday of the month itself. Some games are listed twice under different names so older licenses match.
  { name: 'November 2015 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2015-10-02', price: 12, games: [
    'Legend of Grimrock 2', 'TowerFall Ascension', 'Besiege', 'Valkyria Chronicles', 'Lethal League',
    'SanctuaryRPG: Black Edition', 'Saints Row IV'] },
  { name: 'December 2015 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2015-11-06', price: 12, games: [
    'TowerFall Ascension', 'PAYDAY 2', 'Banished', 'Rust', 'NEON STRUCT', 'Chroma Squad', 'Company of Heroes 2',
    'Company of Heroes 2 - The British Forces', 'Company of Heroes 2 - The Western Front Armies'] },
  { name: 'January 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2015-12-04', price: 12, games: [
    'The Talos Principle', 'The Masterplan', 'Mushroom 11', 'Grim Fandango Remastered', 'Spelunky', 'A Fistful of Gun'] },
  { name: 'February 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-01-01', price: 12, games: [
    'Alien: Isolation', 'Broken Age', 'Penarium', 'Dropsy', 'Titan Souls', 'Volume'] },
  { name: 'March 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-02-05', price: 12, games: [
    'ARK: Survival Evolved', "Wasteland 2: Director's Cut", 'Wasteland 1 - The Original Classic', 'GRAV',
    "Shantae and the Pirate's Curse", 'I am Bread', 'Sentinels of the Multiverse', 'Switchcars',
    'BATTLESLOTHS 2025: The Great Pizza Wars'] },
  { name: 'April 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-03-04', price: 12, games: [
    'South Park: The Stick of Truth', 'This War of Mine', 'Nuclear Throne',
    'Renowned Explorers: International Society', 'Nova-111', 'The Magic Circle', 'Avalanche 2: Super Avalanche',
    'Stikbold! A Dodgeball Adventure'] },
  { name: 'May 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-04-01', price: 12, games: [
    'Mad Max', 'Infinifactory', 'Crawl', 'JumpJet Rex', 'Fran Bow', 'GALAK-Z: The Dimensional',
    "Oddworld: New 'n' Tasty", '1993 Space Machine', 'Gunmetal Arcadia Zero'] },
  { name: 'June 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-05-06', price: 12, games: [
    'Rocket League', 'The Forest', 'Planetary Annihilation: TITANS', 'Steredenn', 'WASTED',
    'Dungeon of the Endless - Crystal Edition', 'Dungeon of the Endless', 'Keep Talking and Nobody Explodes'] },
  { name: 'July 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-06-03', price: 12, games: [
    'Hurtworld', 'Kentucky Route Zero', 'Satellite Reign', 'TIS-100', 'The Red Solstice', 'Avernum 2: Crystal Souls',
    'Cthulhu Realms - Full Version', 'Copoka'] },
  { name: 'August 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-07-01', price: 12, games: [
    'Call of Duty: Black Ops III - Multiplayer Starter Pack', 'Poi', 'The Jackbox Party Pack 2', 'Planet of the Eyes',
    'Random Access Murder', 'Starward Rogue', 'The Incredible Adventures of Van Helsing: Final Cut'] },
  { name: 'September 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-08-05', price: 12, games: [
    'SOMA', 'The Banner Saga', 'WWE 2K16', 'Sheltered', 'Epistory - Typing Chronicles', 'Town of Salem'] },
  { name: 'October 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-09-02', price: 12, games: [
    'Grim Dawn', 'Slime Rancher', 'Hotline Miami 2: Wrong Number', 'Deponia Doomsday', 'Train Valley', 'Action Henk',
    'Thoth', 'Fidel Dungeon Rescue'] },
  { name: 'November 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-10-07', price: 12, games: [
    'Stardew Valley', 'Broforce', 'Rebel Galaxy', 'Beyond Eyes', 'Kathy Rain', 'Styx: Master of Shadows',
    'Pirate Pop Plus', 'Keyboard Sports - Saving QWERTY'] },
  { name: 'December 2016 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-11-04', price: 12, games: [
    "Dragon's Dogma: Dark Arisen", 'The Escapists', 'The Escapists - Alcatraz',
    'The Escapists - Duct Tapes are Forever', 'The Escapists - Escape Team',
    'The Escapists - Fhurst Peak Correctional Facility', 'Mordheim: City of the Damned', 'Hacknet', 'Western Press',
    'Western Press - Cans Mk II', 'The Flame in the Flood', 'Minion Masters', 'Minion Masters - Premium Upgrade'] },
  { name: 'January 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2016-12-02', price: 12, games: [
    'Warhammer: End Times - Vermintide', 'Warhammer: End Times - Vermintide Schluesselschloss',
    'Warhammer: End Times - Vermintide The Outsider', 'Project CARS', 'Mother Russia Bleeds',
    'The Legend of Heroes: Trails in the Sky', 'Neon Chrome', 'Jotun: Valhalla Edition', 'HoPiKo', 'Kimmy'] },
  { name: 'February 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-01-06', price: 12, games: [
    'XCOM 2', 'Ryse: Son of Rome', 'ABZU', 'SteamWorld Heist', 'Okhlos: Omega', 'Project Highrise', 'Husk'] },
  { name: 'March 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-02-03', price: 12, games: [
    'Total War: WARHAMMER', 'Poly Bridge', 'Space Run Galaxy', 'One Piece Pirate Warriors 3', 'RIVE', 'Flat Heroes',
    'Morphblade'] },
  { name: 'April 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-03-03', price: 12, games: [
    'The Witness', 'Layers of Fear: Masterpiece Edition', 'Black Mesa', 'Kingdom: New Lands', 'Event[0]',
    'Tumblestone', 'Slime-san: Superslime Edition'] },
  { name: 'May 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-04-07', price: 12, games: [
    'DiRT Rally', 'INSIDE', 'This Is the Police', 'Undertale', 'Metrico+', 'The Turing Test',
    'GoNNER - Press Jump To Die Edition', 'Super Rude Bear Resurrection', 'A2Be - A Science-Fiction Narrative'] },
  { name: 'June 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-05-05', price: 12, games: [
    'Stellaris', 'Ashes of the Singularity: Escalation', 'Brigador: Up-Armored Edition', 'Maize',
    'Plague Inc: Evolved', 'SUPERHOT', 'Shoppe Keep - Deluxe Edition', 'Tiny Echo'] },
  { name: 'July 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-06-02', price: 12, games: [
    'DARK SOULS II: Scholar of the First Sin', 'Galactic Civilizations III', 'Armello', 'Hyper Light Drifter',
    'Kero Blaster', "Sherlock Holmes: The Devil's Daughter", 'SimplePlanes'] },
  { name: 'August 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-07-07', price: 12, games: [
    'Pillars of Eternity', 'NBA 2K17', 'Offworld Trading Company', 'One Piece Burning Blood', 'Overcooked',
    'War for the Overworld', 'Wuppo: Definitive Edition', 'Nongünz', 'Wuppo'] },
  { name: 'September 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-08-04', price: 12, games: [
    'Killing Floor 2', 'The Banner Saga 2', 'Worms W.M.D', 'Stories Untold', 'Momodora: Reverie Under The Moonlight',
    'HackyZack', 'Eterium'] },
  { name: 'October 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-09-01', price: 12, games: [
    'Rise of the Tomb Raider', 'Wargame: Red Dragon', 'Furi', 'Getting Over It with Bennett Foddy',
    'Orwell: Keeping an Eye On You', 'Scanner Sombre', 'Seasons after Fall', 'The Shrouded Isle'] },
  { name: 'November 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-10-06', price: 12, games: [
    'The Elder Scrolls Online', 'Resident Evil 5 Gold Edition', 'Dead Rising 2',
    'Shadow Tactics: Blades of the Shogun', 'Quake Champions', 'Emily is Away Too', 'Silence', 'World to the West'] },
  { name: 'December 2017 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-11-03', price: 12, games: [
    'BlazBlue: Chronophantasma Extend', 'Nex Machina', 'Passpartout: The Starving Artist', 'Rivals of Aether',
    'STRAFE: Gold Edition', 'The Sexy Brutale', 'Z1 Battle Royale', 'H1Z1'] },
  { name: 'January 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2017-12-01', price: 12, games: [
    'Tomb Raider', 'Quantum Break', 'Warhammer 40,000: Dawn of War III', 'Sleeping Dogs: Definitive Edition',
    'The Long Dark', 'HIVESWAP: ACT 1', 'Mr. Shifty', 'Cursed Castilla (Maldita Castilla EX)'] },
  { name: 'February 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-01-05', price: 12, games: [
    "Sid Meier's Civilization VI", "Sid Meier's Civilization VI: Australia Civilization & Scenario Pack",
    "Sid Meier's Civilization VI: Vikings Scenario Pack", 'Life is Strange Complete Season (Episodes 1-5)', 'Owlboy',
    'Tacoma', 'Snake Pass', 'Black The Fall', 'The Norwood Suite', 'Fortune-499',
    'Civilization VI - Vikings Scenario Pack', 'Civilization VI - Australia Civilization & Scenario Pack'] },
  { name: 'March 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-02-02', price: 12, games: [
    'DARK SOULS III', 'DARK SOULS III - Ashes of Ariandel', 'Aviary Attorney', "Holy Potatoes! We're in Space?!",
    'Last Day of June', 'Lost Castle', 'Overgrowth', 'Splasher'] },
  { name: 'April 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-03-02', price: 12, games: [
    'Deus Ex: Mankind Divided', 'Mafia III: Definitive Edition', 'Mafia III: Sign of the Times', 'Outlast 2',
    "Sid Meier's Civilization: Beyond Earth - The Collection", 'GOD EATER 2 Rage Burst', 'Lara Croft GO',
    'Laser League: World Arena', 'AER Memories of Old', 'Subterrain', 'AER'] },
  { name: 'May 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-04-06', price: 12, games: [
    'Kerbal Space Program', 'Dead Rising 4', 'RUINER', 'NBA Playgrounds', 'Crazy Machines 3', 'Jalopy',
    'Moon Hunters', 'RUNNING WITH RIFLES'] },
  { name: 'June 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-05-04', price: 12, games: [
    'Yooka-Laylee', 'Styx: Shards of Darkness', "Ken Follett's The Pillars of the Earth",
    'Cook, Serve, Delicious! 2!!', "Bear With Me - Collector's Edition", 'Acceleration of SUGURI 2',
    'Subserial Network'] },
  { name: 'July 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-06-01', price: 12, games: [
    'Hearts of Iron IV', 'Portal Knights', 'Titan Quest Anniversary Edition', 'Titan Quest: Ragnarök',
    'Interplanetary: Enhanced Edition', 'Shiness: The Lightning Kingdom', 'Forts', 'Serial Cleaner', 'Blackwake',
    'Titan Quest Anniversary + Ragnarok'] },
  { name: 'August 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-07-06', price: 12, games: [
    'A Hat in Time', 'The Escapists 2', 'Conan Exiles', 'The Surge', 'Sudden Strike 4', 'Kona',
    'Pathologic Classic HD', 'Forged Battalion'] },
  { name: 'September 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-08-03', price: 12, games: [
    'Sniper Elite 4', 'Tales of Berseria', 'Staxel', 'Rise of the Tomb Raider', 'Little Nightmares',
    'Darksiders II Deathinitive Edition', 'Battle Chef Brigade', 'Zombie Night Terror', 'Figment', 'ETHEREAL'] },
  { name: 'October 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-09-07', price: 12, games: [
    'American Truck Simulator', 'Dungeons 3', 'Gremlins, Inc.', 'Hidden Folks', "Old Man's Journey",
    'We Were Here Too'] },
  { name: 'November 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-10-05', price: 12, games: [
    '7 Days to Die', 'HITMAN: THE COMPLETE FIRST SEASON', 'Hollow Knight', 'Dead Island Definitive Edition',
    'Resident Evil Revelations', 'Hard Reset Redux', 'Sniper Elite', 'Sniper Elite V2', 'The Dwarves'] },
  { name: 'December 2018 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-11-02', price: 12, games: [
    'METAL GEAR SOLID V: The Definitive Experience', 'Cities: Skylines', 'Cities: Skylines - After Dark',
    'Mega Man Legacy Collection', 'Zombie Army Trilogy', 'Immortal Redneck', 'Purrfect Date',
    'Seven: Enhanced Edition', 'NeuroVoider', 'METAL GEAR SOLID V: GROUND ZEROES',
    'METAL GEAR SOLID V: THE PHANTOM PAIN'] },
  { name: 'January 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2018-12-07', price: 12, games: [
    'Project CARS 2', 'Just Cause 3 XXL Edition', '>observer_', 'Q.U.B.E. 2', 'Regions Of Ruin',
    'Sundered: Eldritch Edition', 'The Darkside Detective', 'Wizard of Legend', 'Roombo: First Blood'] },
  { name: 'February 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-01-04', price: 12, games: [
    'Yakuza 0', 'Rock of Ages 2: Bigger & Boulder', 'Sniper Elite 3', 'Aaero', 'Bleed 2', 'Full Metal Furies',
    'Rapture Rejects', 'Super Daryl Deluxe'] },
  { name: 'March 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-02-01', price: 12, games: [
    "Warhammer: Vermintide 2 - Collector's Edition", 'EARTH DEFENSE FORCE 4.1 The Shadow of New Despair',
    'Cultist Simulator', "Fight'N Rage", 'Gleipnir', 'Late Shift', 'Paradigm', 'Slipstream', 'Tower Unite'] },
  { name: 'April 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-03-01', price: 12, games: [
    'Mutant Year Zero: Road to Eden', 'Northgard: Definitive Edition', 'Absolver', 'Dandara: Trials of Fear Edition',
    'Minit', 'She Remembered Caterpillars', 'Steel Rats', 'Tannenberg'] },
  { name: 'May 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-04-05', price: 12, games: [
    'Wandersong', 'Finding Paradise', 'Monster Prom', 'The Journey Down: Chapter Three', 'Do Not Feed the Monkeys',
    'I am not a Monster: First Contact'] },
  { name: 'June 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-05-03', price: 12, games: [
    'Red Faction Guerrilla Re-Mars-tered', '911 Operator', '911 Operator - Special Resources', 'Duskers', 'Paratopic',
    'Pool Panic', 'macdows 95'] },
  { name: 'July 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-06-07', price: 12, games: [
    "Hellblade: Senua's Sacrifice", 'Warhammer 40,000: Mechanicus', 'Moonlighter', '60 Parsecs!', 'Love is Dead',
    'NAIRI: Tower of Shirin', 'Road Redemption', 'Kind Words (lo fi chill beats to write to)'] },
  { name: 'August 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-07-05', price: 12, games: [
    'Kingdom Come: Deliverance', 'Surviving Mars', 'Rising Storm 2: Vietnam', 'Almost There: The Platformer',
    'Swords and Soldiers 2 Shawarmageddon', 'The Adventure Pals', "Yoku's Island Express"] },
  { name: 'September 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-08-02', price: 12, games: [
    'Squad', 'Slay the Spire', 'Distance', 'Guacamelee! 2', 'MOTHERGUNSHIP', 'State of Mind', "God's Trigger"] },
  { name: 'October 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-09-06', price: 12, games: [
    'BATTLETECH', 'BATTLETECH - Flashpoint', 'BATTLETECH Shadow Hawk Pack', 'Sonic Mania', 'Avernum 3: Ruined World',
    'Override: Mech City Brawl', 'PLANET ALPHA', 'PUSS!', 'The Spiral Scouts'] },
  { name: 'November 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-10-04', price: 12, games: [
    'Call of Duty: WWII', 'Crash Bandicoot N. Sane Trilogy', 'Spyro Reignited Trilogy', 'Shenmue I & II',
    '11-11 Memories Retold', 'Evergarden', 'SYNTHETIK: Legion Rising'] },
  { name: 'December 2019 Humble Monthly', store: 'Humble Bundle', kind: 'sub', date: '2019-11-01', price: 12, games: [
    'SOULCALIBUR VI', 'Yakuza Kiwami', 'My Time at Portia', 'Chasm', 'Fluffy Horde', 'Regular Human Basketball',
    'Sword Legacy Omen'] },
  { name: 'December 2019 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2019-12-01', price: null, games: [
    'Aegis Defenders', 'Ancestors Legacy', 'Blasphemous', 'Dark Future: Blood Red States', 'Dead In Vinland',
    'Desert Child', 'Horizon Chase Turbo', 'Phantom Doctrine', 'Shadow of the Tomb Raider', 'X-Morph: Defense'] },
  { name: 'May 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-05-01', price: null, games: [
    'Jurassic World Evolution', 'XCOM 2', 'Rise of Industry', 'Niche - a genetics survival game',
    'Warhammer 40,000: Gladius - Relics of War', 'The Swords of Ditto', 'WARSAW', 'Heave Ho', 'MO:Astray', 'NEOVERSE',
    'Chess Ultra', 'Horace'] },
  { name: 'July 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-07-03', price: null, games: [
    'Age of Wonders: Planetfall Deluxe Edition', 'Void Bastards', 'Railway Empire', 'Sigma Theory: Global Cold War',
    'Beat Hazard 2', 'Verlet Swing', 'Earthlock', 'Basingstoke', "Don't Escape: 4 Days to Survive",
    'Battlestar Galactica Deadlock', 'Metal Unit', 'Yuppie Psycho', 'Vikings - Wolves of Midgard'] },
  { name: 'August 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-08-07', price: null, games: [
    'A Case of Distrust', 'American Fugitive', 'Automachef', 'Call of Cthulhu', 'Genesis Alpha One Deluxe Edition',
    'Hello Neighbor', 'Hello Neighbor: Hide and Seek', 'Little Big Workshop', 'The Coma 2: Vicious Sisters',
    'Through the Darkest of Times', 'Vampyr', 'Wargroove', 'We Were Here Together'] },
  { name: 'September 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-09-01', price: null, games: [
    'Catherine Classic', 'Golf With Your Friends', 'Lethal League Blaze', 'Generation Zero', 'Forager',
    'Vampire: The Masquerade - Coteries of New York', 'Fun with Ragdolls: The Game', 'Strange Brigade',
    'Evoland Legendary Edition', 'Yooka-Laylee and the Impossible Lair', 'The Occupation', 'The Shapeshifting Detective'] },
  { name: 'December 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-12-01', price: null, games: [
    'Overcooked! 2', 'Overcooked! 2 - Too Many Cooks Pack', "Overcooked! 2 - Surf 'n' Turf", 'Children of Morta',
    'One Step From Eden', 'The Beast Inside', 'Indivisible', 'Shining Resonance Refrain', 'Zwei: The Arges Adventure',
    'Zwei: The Ilvard Insurrection', 'Tabletop Playground', 'The Haunted Island, a Frog Detective Game',
    'Frog Detective 2: The Case of the Invisible Wizard', 'Still There', 'Struggling', 'Path of Giants'] },
  { name: 'April 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-04-04', price: 11.99, games: [
    "DEATH STRANDING DIRECTOR'S CUT", 'Aliens: Fireteam Elite', 'Rollerdrome', 'Life is Strange 2 Complete Season',
    'The Life and Suffering of Sir Brante', 'Monster Prom 2: Monster Camp', 'Revita', "Founders' Fortune"] },
  // Every other Humble Bundle with Steam keys, from barter.vg's Humble Bundle list (saved Sep 30, 2026): date is when
  // it went on sale and games are the items barter.vg links to Steam (apps and packages); other platforms are left out.
  // Prices aren't in that list, so they're null.
  { name: 'Humble Indie Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2010-05-04', price: null, games: [
    'Humble Indie Bundle', 'Samorost 2 + OST'] },
  { name: 'Humble Indie Bundle #2', store: 'Humble Bundle', kind: 'bundle', date: '2010-12-14', price: null, games: [
    'Cortex Command', 'Humble Indie Bundle 2 - Retail', 'Humble Indie Bundle', 'Samorost 2 + OST'] },
  { name: 'Humble Frozenbyte Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2011-04-12', price: null, games: [
    'Humble Frozenbyte Bundle'] },
  { name: 'Humble Indie Bundle #3', store: 'Humble Bundle', kind: 'bundle', date: '2011-07-26', price: null, games: [
    'Humble Indie Bundle 3', 'Cortex Command', 'Humble Indie Bundle 2 - Retail'] },
  { name: 'Humble Frozen Synapse Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2011-09-28', price: null, games: [
    'Frozen Synapse + TRAUMA', 'SpaceChem', 'Humble Frozenbyte Bundle'] },
  { name: 'Humble Voxatron Debut', store: 'Humble Bundle', kind: 'bundle', date: '2011-10-31', price: null, games: [
    'Gish', 'Binding of Isaac + Blocks That Matter + Binding of Isaac Soundtrack'] },
  { name: 'Humble Introversion Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2011-11-22', price: null, games: [
    'Introversion Humble Indie Bundle Retail', 'Introversion Humble Indie Bundle BTA Bonus tier'] },
  { name: 'Humble Indie Bundle #4', store: 'Humble Bundle', kind: 'bundle', date: '2011-12-13', price: null, games: [
    'Humble Indie Bundle 4', 'Humble Indie Bundle 4 BTA', 'Humble Indie Bundle 4 Extra Bonus'] },
  { name: 'Humble Bundle for Android', store: 'Humble Bundle', kind: 'bundle', date: '2012-01-13', price: null, games: [
    'Humble Indie Bundle for Android tier 1', 'Toki Tori', 'World of Goo'] },
  { name: 'Humble Bundle for Android #2', store: 'Humble Bundle', kind: 'bundle',
    date: '2012-03-19', price: null, games: [
    'Canabalt', 'Humble Indie Bundle for Android 2 tier 1', 'Swords and Soldiers HD'] },
  { name: 'Humble Botanicula Debut', store: 'Humble Bundle', kind: 'bundle', date: '2012-04-19', price: null, games: [
    'Humble Indie Bundle Botanicula Debut', 'Windosill'] },
  { name: 'Humble Indie Bundle V', store: 'Humble Bundle', kind: 'bundle', date: '2012-05-31', price: null, games: [
    'Humble Indie Bundle 5', 'Bastion', 'Humble Indie Bundle 5 Moar Stuff'] },
  { name: 'Humble Bundle for Android #3', store: 'Humble Bundle', kind: 'bundle',
    date: '2012-08-15', price: null, games: [
    'Humble Bundle for Android 3 tier 1', 'Spirits', 'World of Goo, Anomaly, Osmos, and EDGE'] },
  { name: 'Humble Indie Bundle 6', store: 'Humble Bundle', kind: 'bundle', date: '2012-10-01', price: null, games: [
    'Humble Indie Bundle 6', 'Dustforce', 'Humble Indie Bundle 6 Bonus'] },
  { name: 'Humble Bundle for Android #4', store: 'Humble Bundle', kind: 'bundle',
    date: '2012-11-11', price: null, games: [
    'Crayon Physics Deluxe', 'Eufloria', 'Splice', 'Superbrothers: Sword & Sworcery EP', 'Waking Mars',
    'Avadon: The Black Fortress', 'Canabalt', 'Cogs', 'Machinarium', 'Swords and Soldiers HD', 'Zen Bound 2'] },
  { name: 'The Amnesia Fortnight 2012', store: 'Humble Bundle', kind: 'bundle',
    date: '2012-11-19', price: null, games: [
    'Amnesia Fortnight 2012 - The Series', 'Humble Amnesia Fortnight Bundle 2012', 'BRAZEN Prototype'] },
  { name: 'Humble THQ Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2012-11-29', price: null, games: [
    'THQ Humble Bundle Core - Nov 2012', 'Red Faction: Armageddon - Path to War DLC', 'Saints Row: The Third',
    'Titan Quest', 'Warhammer 40,000: Dawn of War - Anniversary Edition'] },
  { name: 'Humble Indie Bundle 7', store: 'Humble Bundle', kind: 'bundle', date: '2012-12-19', price: null, games: [
    'Closure', 'Indie Game: The Movie', 'Shank 2', 'Snapshot', 'The Binding Of Isaac with Wrath of the Lamb DLC',
    'Cave Story+', 'Dungeon Defenders Collection (Summer-Winter 2012)', 'Legend of Grimrock', 'Offspring Fling!',
    'The Basement Collection'] },
  { name: 'Humble Bundle with Android 5', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-03-05', price: null, games: [
    'Beat Hazard Complete', 'Dynamite Jack', 'NightSky', 'Solar 2', 'Crayon Physics Deluxe',
    'Dungeon Defenders Collection (Summer-Winter 2012)', 'Splice', 'Super Hexagon',
    'Superbrothers: Sword & Sworcery EP'] },
  { name: 'Humble Weekly Sale: Bastion', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-03-19', price: null, games: [
    'Bastion'] },
  { name: 'Humble Weekly Sale: THQ', store: 'Humble Bundle', kind: 'bundle', date: '2013-03-26', price: null, games: [
    'Darksiders', 'Red Faction: Armageddon', 'Red Faction: Armageddon - Path to War DLC', 'Darksiders II',
    'Red Faction: Guerrilla Steam Edition'] },
  { name: 'Humble Weekly Sale: Tripwire Interactive', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-04-02', price: null, games: [
    'Red Orchestra 2 Retail', 'Red Orchestra: Ostfront 41-45', 'Killing Floor Bundle 2013'] },
  { name: 'Humble Weekly Sale: Blendo Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-04-09', price: null, games: [
    'Air Forte', 'Atom Zombie Smasher', 'Flotilla', 'Thirty Flights of Loving'] },
  { name: 'Humble Double Fine Bundle 2013', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-05-07', price: null, games: [
    'Humble Double Fine Bundle 2013 tier 1', 'Brütal Legend', 'BRAZEN Prototype',
    'Humble Amnesia Fortnight Bundle 2012', 'Broken Age'] },
  { name: 'Humble Weekly Sale: Alan Wake', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-05-22', price: null, games: [
    "Alan Wake Collector's Edition", "Alan Wake's American Nightmare"] },
  { name: 'Humble Indie Bundle 8', store: 'Humble Bundle', kind: 'bundle', date: '2013-05-28', price: null, games: [
    'Awesomenauts', 'Awesomenauts - Cluck', 'Capsized', 'Dear Esther', 'Little Inferno', 'Thomas Was Alone',
    'English Country Tune', 'Hotline Miami', 'Intrusion 2', 'Oil Rush Bundle', 'Proteus',
    "Tiny and Big: Grandpa's Leftovers"] },
  { name: 'Humble Weekly Sale 2013: Telltale Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-05-30', price: null, games: [
    'Telltale Games Bundle tier 1 package (Humble Weekly Sale 2013)', 'The Walking Dead'] },
  { name: 'Humble Weekly Sale: 11 bit studios', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-06-06', price: null, games: [
    'Anomaly Warzone Earth', 'Anomaly Warzone Earth Mobile Campaign'] },
  { name: 'Humble Weekly: Serious Sam', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-06-06', price: null, games: [
    'Serious Sam Double D XXL', 'Serious Sam HD: The First Encounter', 'Serious Sam HD: The Second Encounter',
    'Serious Sam: The Random Encounter', 'Serious Sam 2', 'Serious Sam 3 Deluxe'] },
  { name: 'Humble Bundle with Android 6', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-06-18', price: null, games: [
    'Aquaria', 'Fractal: Make Blooms Not War', "Organ Trail: Director's Cut", 'Stealth Bastard Deluxe',
    "Broken Sword 1 - Shadow of the Templars: Director's Cut", 'Frozen Synapse', 'McPixel', 'NightSky',
    'Waking Mars'] },
  { name: 'Humble Weekly Sale: Rochard', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-06-20', price: null, games: [
    'Rochard', 'Rochard - Hard Times'] },
  { name: 'Humble Weekly Sale: Klei Entertainment', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-06-27', price: null, games: [
    'Eets', 'Shank', 'Shank 2'] },
  { name: 'Humble Weekly Sale: Two Tribes', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-07-04', price: null, games: [
    'EDGE', 'Toki Tori', 'RUSH'] },
  { name: 'Humble Weekly Sale: Spiderweb Software', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-07-11', price: null, games: [
    'Avadon: The Black Fortress', 'Avernum 4+5+6 Bundle - The Great Trials Trilogy', 'Geneforge Saga',
    'Avernum: Escape From the Pit', 'Nethergate: Resurrection'] },
  { name: 'Humble Weekly Sale: Jim Guthrie and Friends', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-07-18', price: null, games: [
    'Indie Game: The Movie', 'Superbrothers: Sword & Sworcery EP'] },
  { name: 'Humble Weekly Sale: Positech Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-07-25', price: null, games: [
    'Gratuitous Space Battles', 'Gratuitous Tank Battles', 'Democracy 2'] },
  { name: 'Humble Deep Silver Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2013-07-30', price: null, games: [
    'Humble Deep Silver Bundle 2013 tier 1', 'Humble Deep Silver Bundle 2013 BTA tier week1',
    'Humble Deep Silver Bundle 2013 BTA tier week2', 'Dead Island Riptide'] },
  { name: 'Humble Weekly Sale: 1C Company', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-08-01', price: null, games: [
    "King's Bounty: Armored Princess", "King's Bounty: The Legend", 'Men of War', 'Men of War: Red Tide',
    "King's Bounty: Crossworlds", 'Men of War: Assault Squad'] },
  { name: 'Humble Weekly Sale: Introversion', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-08-08', price: null, games: [
    'Introversion Humble Indie Bundle Retail', 'Prison Architect'] },
  { name: 'Humble Origin Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2013-08-14', price: null, games: [
    'Burnout Paradise: The Ultimate Box', 'Crysis 2 Maximum Edition', 'Dead Space (2008)',
    'Medal of Honor(TM) Single Player', "Mirror's Edge", 'Command & Conquer™ Red Alert™ 3 - Uprising'] },
  { name: 'Humble Weekly Sale: Hosted by PewDiePie', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-08-15', price: null, games: [
    'Botanicula', 'McPixel', 'The Showdown Effect', 'Thomas Was Alone', 'Amnesia: The Dark Descent'] },
  { name: 'Humble Weekly Sale: Paradox Interactive', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-08-29', price: null, games: [
    'Dungeonland - All Access Pass (sub/18840)', 'Europa Universalis III', 'Leviathan: Warships', 'The Showdown Effect',
    'War of the Roses: Kingmaker', 'Warlock - Master of the Arcane', 'Magicka + Crusader Kings II Retail',
    'Paradox Big Kahuna Bundle'] },
  { name: 'Humble Weekly Sale: Arcen Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-09-05', price: null, games: [
    'A Valley Without Wind 1 and 2 Dual Pack', 'AI War: Vengeance Of The Machine', 'Arcen Games Comp',
    'Shattered Haven', 'Skyward Collapse', 'Skyward Collapse: Nihon no Mura'] },
  { name: 'Humble Indie Bundle 9', store: 'Humble Bundle', kind: 'bundle', date: '2013-09-11', price: null, games: [
    'Brütal Legend', 'Eets Munchies', 'Mark of the Ninja', 'Trine 2 CE + Goblin Menace', 'A Virus Named TOM', 'Bastion',
    'FEZ', 'FTL: Faster Than Light', 'LIMBO', 'Rocketbirds: Hardboiled Chicken'] },
  { name: 'Humble Weekly: Retro Shooters', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-09-12', price: null, games: [
    'Duke Nukem 3D and Shadow Warrior Bundle', 'Serious Sam HD: The First Encounter',
    'Serious Sam HD: The Second Encounter', 'Hard Reset', 'System Shock® 2 (1999)'] },
  { name: 'Humble Weekly Sale: Egosoft Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-09-19', price: null, games: [
    'X Universe Bundle A', 'X Universe Bundle B'] },
  { name: 'Humble Weekly Sale: Kalypso Media', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-09-26', price: null, games: [
    'Kalypso Bundle 1', 'Kalypso Bundle 2'] },
  { name: 'Humble Weekly Sale: Nordic Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-10-03', price: null, games: [
    'Neighbours from Hell Compilation', 'Nordic A (HUMBLE)', 'Nordic B (HUMBLE)'] },
  { name: 'Humble Weekly Sale: Focus Home Interactive', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-10-10', price: null, games: [
    'Focus Humble Bundle 1', 'Focus Humble Bundle 1 Beat The Average'] },
  { name: 'Humble Bundle: PC and Android 7', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-10-15', price: null, games: [
    'Anodyne', 'Greed Corp', 'Incredipede', 'Ticket to Ride', 'Ticket to Ride - USA 1910', 'Anomaly Korea',
    "Broken Sword 1 - Shadow of the Templars: Director's Cut", "Organ Trail: Director's Cut", "The Bard's Tale",
    'Ticket to Ride - Europe', 'Worms Reloaded'] },
  { name: 'Hothead Games', store: 'Humble Bundle', kind: 'bundle', date: '2013-10-17', price: null, games: [
    'Hothead Humble Bundle', 'Hothead Humble Bundle BTA'] },
  { name: 'Humble Weekly Sale: Cipher Prime', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-10-24', price: null, games: [
    'Fractal: Make Blooms Not War', 'Splice', 'Auditorium', 'Intake'] },
  { name: 'Humble Weekly Sale: Team 17', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-10-31', price: null, games: [
    'Superfrog HD', 'Worms Armageddon', 'Worms Blast', 'Worms Crazy Golf', 'Worms Pinball', 'Worms Ultimate Mayhem',
    'Alien Breed Trilogy', 'Worms Revolution Gold Edition'] },
  { name: 'Humble WB Games Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2013-11-05', price: null, games: [
    'Batman: Arkham Asylum GOTY Edition', 'F.E.A.R. 2: Project Origin', 'F.E.A.R. 3',
    'The Lord of the Rings: War in the North', 'Batman: Arkham City GOTY',
    'Batman: Arkham Origins - New Millennium Skins Pack', 'FEAR Ultimate Shooter Retail',
    'Gotham City Impostors Free to Play: Professional Impostor Kit', 'Guardians of Middle-earth',
    'Mortal Kombat Kollection', 'Scribblenauts Unlimited', "Smaug's Treasure",
    'The Lord of the Rings Online: Steely Dawn Starter Pack'] },
  { name: 'Humble Weekly Sale: Daedalic Entertainment', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-11-07', price: null, games: [
    'A New Beginning - Final Cut', "Edna & Harvey: Harvey's New Eyes",
    'The Whispered World + The Whispered World Special Edition', 'Deponia', 'Journey of a Roach',
    'The Dark Eye: Chains of Satinav'] },
  { name: 'bitComposer Games', store: 'Humble Bundle', kind: 'bundle', date: '2013-11-14', price: null, games: [
    'Air Conflicts: Pacific Carriers', 'Galaxy on Fire 2 Full HD', 'Thunder Wolves', 'Expeditions: Conquistador',
    'Jagged Alliance: Crossfire'] },
  { name: 'Humble Weekly Sale: Zen Studios', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-11-21', price: null, games: [
    'Pinball FX2 Humble Basic Key', 'Pinball FX2 Humble Bonus Key'] },
  { name: 'Humble Weekly Sale: Nov 28, 2013', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-11-28', price: null, games: [
    'Closure', 'Jamestown', 'Shatter', 'Space Pirates and Zombies', 'Defense Grid: Combo Retail',
    'Dungeon Defenders Collection (Summer-Winter 2012)'] },
  { name: "Yogscast's Dwarven Dairy Drive", store: 'Humble Bundle', kind: 'bundle',
    date: '2013-12-01', price: null, games: [
    'Awesomenauts', "Garry's Mod", 'Magicka: Wizard Wars', 'Rust', 'Sanctum: Collection', 'Shank 2',
    'Sonic & All-Stars Racing Transformed Collection', 'The Chaos Engine', 'Torchlight',
    'Total War: NAPOLEON - Definitive Edition', 'War of the vikings - Yogscast Charity Helmet'] },
  { name: 'Humble Jumbo Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2013-12-03', price: null, games: [
    'Magicka + 2 DLC', 'Natural Selection 2', 'Sanctum 2', 'Cities in Motion 2', "Garry's Mod",
    'Orcs Must Die 2 - Complete Pack', 'Orcs Must Die Game of the Year', 'Sanctum: Collection', 'Serious Sam 3: BFE'] },
  { name: 'Humble Weekly Sale: Multimedia Fusion 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-12-05', price: null, games: [
    'Faerie Solitaire', "MANOS: The Hands of Fate ~ Director's Cut", 'OddPlanet', 'Pitiri 1977', 'Knytt Underground',
    'NightSky', 'Really Big Sky'] },
  { name: 'Humble Weekly Sale: ACE Team, ATLUS Games and Tripwire Interactive', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-12-12', price: null, games: [
    'Dwarfs!?', 'Killing Floor', 'Zeno Clash', 'Zeno Clash 2', 'Red Orchestra 2 Multiplayer with Rising Storm',
    'Rock of Ages'] },
  { name: 'Humble Bundle: PC and Android 8', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-12-17', price: null, games: [
    'AaaaaAAaaaAAAaaAAAAaAAAAA!!! for the Awesome', 'Gemini Rue', 'Jack Lumber', 'Little Inferno', 'Anomaly 2',
    'Bad Hotel', 'Hero Academy - Gold Pack', 'Solar 2', "The Bard's Tale"] },
  { name: 'Humble Weekly Sale: Puppy Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-12-19', price: null, games: [
    'Droid Assault', 'Revenge of the Titans', 'Revenge of the Titans: Sandbox Mode', 'Titan Attacks', 'Ultratron'] },
  { name: 'Humble Weekly Sale: Penny Arcade', store: 'Humble Bundle', kind: 'bundle',
    date: '2013-12-26', price: null, games: [
    'On the Rain-Slick Precipice of Darkness, Episode One', 'On the Rain-Slick Precipice of Darkness, Episode Two',
    "Penny Arcade's On the Rain-Slick Precipice of Darkness 3",
    "Penny Arcade's On the Rain-Slick Precipice of Darkness 4"] },
  { name: 'Humble Weekly Sale: Amanita & Friends', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-01-02', price: null, games: [
    'Lume', 'Machinarium', 'Samorost 2 + OST', 'Windosill', 'Botanicula', 'Shelter 1'] },
  { name: 'Humble Indie Bundle X', store: 'Humble Bundle', kind: 'bundle', date: '2014-01-07', price: null, games: [
    'BIT.TRIP Presents... Runner2: Future Legend of Rhythm Alien', 'Joe Danger 2: The Movie', 'Papo & Yo',
    'To the Moon', 'HOARD', 'Reus', 'Strike Suit Zero', 'Surgeon Simulator', 'Toki Tori 2+'] },
  { name: 'Humble Weekly Sale: Frozenbyte', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-01-09', price: null, games: [
    'Shadowgrounds', 'Trine', 'Shadowgrounds: Survivor', 'Trine 2 CE + Goblin Menace'] },
  { name: 'Humble Weekly Sale: Bohemia Interactive', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-01-17', price: null, games: [
    'Alpha Prime', 'Arma 2', 'Arma Tactics', 'Arma: Gold Edition', 'Take On Helicopters', 'The Fish Fillets 2',
    'UFO: Afterlight', 'Arma 2: DayZ Mod', 'Arma 2: Operation Arrowhead', 'Arma: Cold War Assault',
    'Carrier Command: Gaea Mission'] },
  { name: 'Humble Roguelike Weekly Sale', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-01-23', price: null, games: [
    'Dungeons of Dredmor Complete', 'Hack, Slash, Loot', 'Paranautical Activity: Deluxe Atonement Edition',
    'Sword of the Stars: The Pit - Osmium Edition', 'Teleglitch: Die More Edition', 'Teleglitch: Guns and Tunes DLC',
    'The Binding Of Isaac with Wrath of the Lamb DLC'] },
  { name: 'Humble Weekly Sale: Codemasters', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-01-30', price: null, games: [
    'Codemasters Bundle 1', 'Codemasters Bundle 2'] },
  { name: 'Humble Sid Meier Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2014-02-04', price: null, games: [
    "Sid Meier's Civilization IV: The Complete Edition", "Sid Meier's Ace Patrol",
    "Sid Meier's Ace Patrol: Pacific Skies", "Sid Meier's Civilization III: Complete", "Sid Meier's Railroads!",
    'Civilization V - Scrambled Continents Map Pack', 'Civilization V - Scrambled Nations Map Pack',
    "Sid Meier's Civilization V", "Sid Meier's Civilization V: Gods and Kings", "Sid Meier's Pirates!",
    "Sid Meier's Civilization V: Brave New World"] },
  { name: 'Amnesia Fortnight 2014', store: 'Humble Bundle', kind: 'bundle', date: '2014-02-06', price: null, games: [
    'Amnesia Fortnight 2014 - The Series', 'Humble Amnesia Fortnight Bundle 2012',
    'Humble Amnesia Fortnight Bundle 2014', 'Little Pink Best Buds Prototype'] },
  { name: 'Humble Weekly Sale: Double Fine', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-02-06', price: null, games: [
    'Costume Quest', 'Psychonauts', 'Stacking', 'Brütal Legend', 'Spacebase DF-9'] },
  { name: 'Humble Weekly Sale: IndieCade', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-02-13', price: null, games: [
    'And Yet It Moves', 'Luxuria Superbia', 'The Dream Machine: Chapters 1+2+3',
    '7 Grand Steps, Step 1: What Ancients Begat', 'Dear Esther', 'The Bridge'] },
  { name: 'Humble Indie Bundle 11', store: 'Humble Bundle', kind: 'bundle', date: '2014-02-18', price: null, games: [
    'Dust: An Elysian Tail', 'Giana Sisters: Twisted Dreams', 'Guacamelee! Gold Edition', 'The Swapper', 'Antichamber',
    'Beatbuddy: Tale of the Guardians', 'FEZ', 'Monaco', 'Starseed Pilgrim'] },
  { name: 'Humble Weekly Sale: The Adventure Company and Friends', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-02-20', price: null, games: [
    'Aura: Fate of the Ages', 'Safecracker: The Ultimate Puzzle Adventure', 'Dark Fall 1: The Journal',
    'Dark Fall 2: Lights Out', 'Deponia', 'Edna & Harvey: The Breakout', 'Jack Keane 2 - The Fire Within',
    'The Book of Unwritten Tales Digital Deluxe Edition',
    'The Book of Unwritten Tales: The Critter Chronicles Collectors Edition',
    'The Raven: Legacy of a Master Thief Digital Deluxe Edition'] },
  { name: 'Humble Weekly Sale: Simulators', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-02-27', price: null, games: [
    'Bridge Project', 'Euro Truck Simulator', 'Trainz Simulator 12', 'Agricultural Simulator 2013 Steam Edition',
    'Agricultural Simulator: Historical Farming', 'Pool Nation', 'Professional Farmer 2014'] },
  { name: 'Humble Bundle of Love for Brandon Boyer', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-03-05', price: null, games: [
    'Actual Sunlight', 'Anomaly Warzone Earth', 'Blocks That Matter', 'Dynamite Jack', 'Electronic Super Joy',
    'Electronic Super Joy Bonus Content', 'Ethan: Meteor Hunter', 'Fancy Skulls', 'Goscurry', 'McPixel', 'P-3 Biotic',
    'POP: Methodology Experiment One', 'Proteus', 'QbQbQb', 'Receiver', 'Samorost 2 + OST'] },
  { name: 'Devolver Digital Double Debut', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-03-06', price: null, games: [
    'Duke Nukem 3D: Megaton Edition', 'Shadow Warrior Classic Redux', 'Cosmic DJ', 'Defense Technica',
    "Marc Eckō's Getting Up: Contents Under Pressure"] },
  { name: 'Humble Weekly Sale: PopCap titles from EA', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-03-06', price: null, games: [
    'PopCap Humble Bundle - Group 1', 'PopCap Humble Bundle - Group 2'] },
  { name: 'Humble Weekly Sale: SEGA', store: 'Humble Bundle', kind: 'bundle', date: '2014-03-13', price: null, games: [
    'Sega - Humble Bundle (1)', 'Sega - Humble Bundle (2)', 'Total War: Shogun 2 Retail'] },
  { name: 'Humble Rhythm Weekly Sale', store: 'Humble Bundle', kind: 'bundle', date: '2014-03-20', price: null, games: [
    'Before the Echo', 'BIT.TRIP RUNNER', 'Symphony', 'Audiosurf', 'Beat Hazard Complete', 'Retro/Grade'] },
  { name: 'Humble Weekly Sale: Celebrating Open Source', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-03-27', price: null, games: [
    'Magical Diary: Horse Hall', 'NEO Scavenger', 'Offspring Fling!', 'Anodyne',
    "Defender's Quest: Valley of the Forgotten", 'Evoland', 'Incredipede'] },
  { name: 'Humble Bundle: PC and Android 9', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-04-01', price: null, games: [
    'Bridge Constructor', 'Broken Sword 2 - the Smoking Mirror: Remastered (2010)', 'Ravensword: Shadowlands',
    'Type:Rider', 'Kingdom Rush', 'Knights of Pen and Paper +1', 'Savant - Ascent (incl. Savant - Ascent REMIX)',
    'Syder Arcade', 'The Shivah'] },
  { name: 'Humble Weekly Sale hosted by Destructoid', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-04-03', price: null, games: [
    'Little Inferno', 'Natural Selection 2', 'Super Hexagon', 'Critter Crunch', 'Hotline Miami',
    'PixelJunk Monsters Ultimate'] },
  { name: 'Humble Weekly Sale: PewDiePie Saves the Children', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-04-10', price: null, games: [
    'Guacamelee! Gold Edition', 'Surgeon Simulator', "Garry's Mod", 'SpeedRunners', 'Probably Archery',
    'State of Decay (+ State of Decay: YOSE Steam Gift to inventory)'] },
  { name: 'Humble Weekly -- Oh Man, You Should Totally Check That Game Out! Presented by Devolver Digital', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-04-17', price: null, games: [
    'Dungeon Hearts', 'The Real Texas', 'Foul Play', "KRUNCH Digital Collector's Edition", 'Legend of Dungeon',
    'Tower of Guns'] },
  { name: 'Humble Weekly Sale Presented by TSG', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-04-24', price: null, games: [
    'Cave Story+', 'Dustforce', 'Puzzle Bots', 'Thomas Was Alone', 'VVVVVV', 'Cthulhu Saves the World', 'Element4l',
    'LIMBO', "Lone Survivor: The Director's Cut", 'Mutant Mudds Deluxe', 'Reus', 'Teslagrad'] },
  { name: 'Humble Co-op Weekly Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-01', price: null, games: [
    'Awesomenauts', 'Sanctum 2', 'Wanderlust: Rebirth', 'Aces Wild: Manic Brawling Action!',
    'Orcs Must Die 2 - Complete Pack', 'Rocketbirds: Hardboiled Chicken', 'Risk of Rain (2013)'] },
  { name: 'Humble Daily Bundle: Deep Silver ReBundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-04', price: null, games: [
    'Humble Deep Silver Bundle 2013 tier 1', 'Humble Deep Silver Bundle 2013 BTA tier week1',
    'Humble Deep Silver Bundle 2013 BTA tier week2', 'Dead Island Riptide Complete Edition'] },
  { name: 'Humble Weekly Bundle: Night Dive Studios', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-08', price: null, games: [
    'Shadow Man', 'Wizardry 6: Bane of the Cosmic Forge', 'Wizardry 7: Crusaders of the Dark Savant', 'Harvester',
    'I Have No Mouth, and I Must Scream', 'The 7th Guest', 'System Shock® 2 (1999)', 'The 11th Hour', 'Wizardry 8'] },
  { name: 'Humble Daily Bundle from Outer Space', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-14', price: null, games: [
    'X3: Terran Conflict', 'Universe Sandbox Legacy', 'Kinetic Void'] },
  { name: 'Humble Daily Bundle: The Banner Saga', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-15', price: null, games: [
    'Starter Pack', 'Variations Pack', 'The Banner Saga'] },
  { name: 'Humble Platforming Weekly Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-15', price: null, games: [
    'BIT.TRIP RUNNER', 'Blocks That Matter', 'Shank 2', 'BIT.TRIP Presents... Runner2: Future Legend of Rhythm Alien',
    "FLY'N", 'Megabyte Punch', "King Arthur's Gold", 'Mark of the Ninja: Special Edition Bundle'] },
  { name: 'Humble Indie re-Bundle 8', store: 'Humble Bundle', kind: 'bundle', date: '2014-05-16', price: null, games: [
    'Awesomenauts', 'Awesomenauts - Cluck', 'Capsized', 'Dear Esther', 'Little Inferno', 'Thomas Was Alone',
    'English Country Tune', 'Hotline Miami', 'Intrusion 2', 'Oil Rush Bundle', 'Proteus',
    "Tiny and Big: Grandpa's Leftovers"] },
  { name: 'Humble Daily Bundle: Team17', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-17', price: null, games: [
    'Superfrog HD', 'Worms Blast', 'Worms Crazy Golf', 'Worms Pinball', 'Worms Ultimate Mayhem', 'Worms Armageddon',
    'Alien Breed 2: Assault', 'Alien Breed 3: Descent', 'Alien Breed: Impact', 'Worms Clan Wars',
    'Worms Revolution Gold Edition'] },
  { name: 'Humble Daily Bundle: Hammerwatch', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-19', price: null, games: [
    'Hammerwatch'] },
  { name: 'Humble Daily Bundle: Melee', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-19', price: null, games: [
    'Guilty Gear Isuka', 'Vanguard Princess', 'Blade Symphony'] },
  { name: 'Humble Daily Bundle: Crusader Kings', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-20', price: null, games: [
    'Crusader Kings Complete', 'Crusader Kings II', 'Crusader Kings II DLC Collection'] },
  { name: 'Humble Daily Bundle: Flying', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-21', price: null, games: [
    'Race The Sun', 'Guns of Icarus Online', 'Strike Vector'] },
  { name: 'Humble Daily Bundle 10', store: 'Humble Bundle', kind: 'bundle', date: '2014-05-22', price: null, games: [
    'Soulcaster: Part I & II', 'Incredipede', 'Escape Goat 2', 'Ironclad Tactics Deluxe Edition'] },
  { name: 'Humble Triumph and Larian Weekly Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-22', price: null, games: [
    'Age of Wonders', 'Age of Wonders: Shadow Magic', 'Beyond Divinity', 'Divine Divinity',
    "Age of Wonders 2: The Wizard's Throne", "Divinity II: Developer's Cut", 'Divinity: Dragon Commander'] },
  { name: 'Humble Daily Bundle: Dungeons', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-23', price: null, games: [
    'Paper Sorcerer', 'Legend of Grimrock', 'Desktop Dungeons'] },
  { name: 'Humble Daily Bundle: Reverb', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-25', price: null, games: [
    'Guncraft', 'Ravaged Zombie Apocalypse', 'Orc Attack: Flatulent Rebellion'] },
  { name: 'Humble Daily Bundle: Total War', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-26', price: null, games: [
    'Napoleon: Total War Collection (17093)', 'Total War: NAPOLEON - Definitive Edition', 'Total War Master Collection',
    'Total War Grand Master Collection'] },
  { name: 'Humble Bundle: PC and Android 10', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-27', price: null, games: [
    'Draw a Stickman: EPIC', 'Galcon Fusion', 'Galcon Legends', 'Symphony', 'Breach & Clear', 'Fieldrunners',
    'Fieldrunners 2', 'Frozen Synapse', 'Ittle Dew', 'METAL SLUG 3', 'Skulls of the Shogun'] },
  { name: 'Humble Weekly Bundle: RPG Maker', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-05-29', price: null, games: [
    'RPG Maker VX Ace', 'RPG Maker VX Ace - Royal Tiles Resource Pack', "RPG Maker VX Ace - The Adventurer's Journey",
    'RPG Maker VX Ace - Tyler Warren RPG Battlers - 1st 50', 'Skyborn', 'Sweet Lily Dreams', 'Deadly Sin 2',
    'RPG Maker VX Ace - Futuristic Tiles Resource Pack', 'RPG Maker VX Ace - High Fantasy Main Party Pack I',
    'RPG Maker VX Ace - High Fantasy Resource Bundle', 'RPG Maker VX Ace - Inspirational Vol. 1',
    'RPG Maker VX Ace - Tyler Warren RPG Battlers - 2nd 50', 'RPG Maker XP', 'To the Moon', 'Game Character Hub',
    "Legionwood 2: Rise of the Eternal's Realm"] },
  { name: 'Humble Weekly Bundle: German Edition', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-06-05', price: null, games: [
    'Beatbuddy: Tale of the Guardians', 'Crazy Machines 2', 'Galaxy on Fire 2 Full HD', 'Spirits',
    'The Great Jitters: Pudding Panic', 'The Guild II Collection', "Tiny and Big: Grandpa's Leftovers", 'ArcaniA',
    'Risen', 'The Book of Unwritten Tales', 'Giana Sisters: Twisted Bundle', 'The Night of the Rabbit'] },
  { name: 'E3 Digital Ticket 2014', store: 'Humble Bundle', kind: 'bundle', date: '2014-06-09', price: null, games: [
    'Anomaly 2', 'Company of Heroes 2 - German Commander: Storm Doctrine',
    'Company of Heroes 2 - German Skin: Four Color Disruptive Pattern Bundle',
    'Company of Heroes 2 - Soviet Commander: Conscripts Support Tactics',
    'Company of Heroes 2 - Soviet Skin: Four Color Belorussian Front Pack', 'Magicka Wizard Wars - Wizard Wars E3',
    'MX vs. ATV Reflex', 'PAYDAY 2: Humble Mask Pack', "Sid Meier's Civilization III: Complete",
    'Total War: ROME II - Nomadic Tribes Culture Pack'] },
  { name: 'Humble Weekly Bundle: Indievision Presented by Devolver Digital', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-06-12', price: null, games: [
    'A Virus Named TOM', 'Serious Sam 3: BFE', 'Serious Sam Complete Comp'] },
  { name: 'Strategy Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2014-06-19', price: null, games: [
    'Cubetractor', 'Sang-Froid - Tales of Werewolves', 'Stronghold Crusader HD', 'Eador. Masters of the Broken World',
    'Space Hulk', 'Unity of Command', 'Ironclad Tactics Deluxe Edition'] },
  { name: 'Summer Games Done Quick 2014 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-06-22', price: null, games: [
    'Amnesia: A Machine for Pigs', 'Bleed', 'Dustforce', 'Electronic Super Joy',
    'Giana Sisters: Twisted Dreams - Rise of the Owlverlord', 'Guacamelee! Gold Edition', 'Gunpoint',
    'Noitu Love 2 Devolution', 'Psychonauts', 'The Basement Collection'] },
  { name: 'Humble Weekly Bundle: Frogwares <3 Ukraine', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-06-26', price: null, games: [
    'Dracula: Love Kills', 'Dracula: Origin', 'Sherlock Holmes and The Hound of The Baskervilles',
    'Sherlock Holmes: The Mystery of The Persian Carpet', 'Sherlock Holmes: Nemesis',
    'Sherlock Holmes: The Awakened (2008)', 'Sherlock Holmes: The Mystery of The Mummy',
    'Sherlock Holmes: The Secret of the Silver Earring', 'Magrunner: Dark Pulse',
    'Sherlock Holmes versus Jack the Ripper'] },
  { name: 'Humble Eye Candy Weekly Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-07-03', price: null, games: [
    '140', 'Ballpoint Universe: Infinite', 'KAMI', 'Antichamber', 'Cinders', 'Secrets of Rætikon', 'Mercenary Kings'] },
  { name: 'Humble 2K Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2014-07-08', price: null, games: [
    'BioShock + BioShock Remastered (14603)', 'The Bureau: XCOM Declassified', 'The Darkness II',
    'BioShock 2 + BioShock 2 Remastered (31771)', 'Mafia II (Classic)', 'Spec Ops: The Line', 'X-COM: Apocalypse',
    'X-COM: Enforcer', 'X-COM: Interceptor', 'X-COM: Terror from the Deep', 'X-COM: UFO Defense', 'BioShock Infinite',
    'XCOM: Enemy Unknown'] },
  { name: 'Humble Weekly Bundle: Gamepedia Presented by Curse', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-07-10', price: null, games: [
    'Paranautical Activity: Deluxe Atonement Edition', 'ReignMaker', 'Stacking', 'Windforge', 'Darkout',
    'Signs of Life', 'Edge of Space', 'Lifeless Planet'] },
  { name: 'Humble Flash Re-Bundle: Codemasters', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-07-14', price: null, games: [
    'Operation Flashpoint: Dragon Rising', 'Operation Flashpoint: Red River', 'Overlord + Raising Hell',
    'Rise of the Argonauts', 'DiRT 3', 'DiRT Showdown', 'Overlord II'] },
  { name: 'Humble Weekly Bundle: Simulators 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-07-17', price: null, games: [
    'Cook, Serve, Delicious!', 'Out of the Park Baseball 14', 'Universe Sandbox Legacy', 'Tropico 4', 'Turbo Dismount',
    'Euro Truck Simulator 2', 'Euro Truck Simulator 2 - Fantasy Paint Jobs Pack'] },
  { name: 'Humble Flash Re-Bundle: Simulators', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-07-21', price: null, games: [
    'Bridge Project', 'Euro Truck Simulator', 'Trainz Simulator 12', 'Wildlife Park 3',
    'Agricultural Simulator 2013 Steam Edition', 'Agricultural Simulator: Historical Farming', 'Pool Nation',
    'Professional Farmer 2014'] },
  { name: 'Humble Square Enix Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2014-07-22', price: null, games: [
    'Anachronox', 'Daikatana', 'Hitman 2: Silent Assassin', 'Hitman: Codename 47', 'Mini Ninjas', 'Thief Gold',
    'Battlestations: Midway', 'Deus Ex: Invisible War', 'Deus Ex: The Fall', 'Hitman: Absolution',
    'Hitman: Blood Money', 'Hitman: Contracts', 'Just Cause', 'Nosgoth - Veteran Pack', 'The Last Remnant',
    'Deus Ex: Game of the Year Edition'] },
  { name: 'Humble Weekly Bundle: Plug In Digital', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-07-24', price: null, games: [
    'Ethan: Meteor Hunter', 'Finding Teddy', 'Mechanic Escape', 'Freaking Meatbags', 'Kill The Bad Guy',
    'Legends of Persia', 'Project Temporality', 'WRC 4 FIA WORLD RALLY CHAMPIONSHIP'] },
  { name: 'Humble Flash Bundle: Humongous Entertainment', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-07-28', price: null, games: [
    'Freddi Fish and the Case of the Missing Kelp Seeds', 'Putt-Putt Joins the Parade',
    'Freddi Fish 2: The Case of the Haunted Schoolhouse', "Pajama Sam in No Need to Hide When It's Dark Outside",
    'Putt-Putt Goes to the Moon', 'SPY Fox in: Dry Cereal', 'Humongous Entertainment Complete Pack'] },
  { name: 'Humble Weekly Bundle: Sci-Fi Edition', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-07-31', price: null, games: [
    'Cosmic DJ', 'Q.U.B.E.', 'VelocityUltra', 'Strike Suit Infinity', 'Strike Vector', 'The Fall',
    'The Last Federation'] },
  { name: 'Humble Flash Bundle: Dejobaan Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-08-04', price: null, games: [
    'AaAaAA!!! - A Reckless Disregard for Gravity', 'The Wonderful End of the World', 'Aaaaa!!! Brutal Concussion',
    'AaaaaAAaaaAAAaaAAAAaAAAAA!!! for the Awesome', 'Monster Loves You!', 'Drunken Robot Pornography'] },
  { name: 'Humble Weekly Bundle: Japan Edition', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-08-07', price: null, games: [
    'Gigantic Army', 'One Way Heroics', 'Unholy Heights', 'Mitsurugi Kamui Hikae', 'PixelJunk Shooter', 'Ys Origin',
    'Astebreed: Definitive Edition'] },
  { name: 'Humble Flash Bundle: Artifex Mundi', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-08-11', price: null, games: [
    'Abyss: The Wraiths of Eden', 'Nightmares from the Deep: The Cursed Heart', '9 Clues: The Secret of Serpent Creek',
    'Nightmares from the Deep 2: The Siren`s Call', 'Enigmatis 2: The Mists of Ravenwood'] },
  { name: 'Humble Flash Bundle: Rhythm', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-08-18', price: null, games: [
    '140', 'Electronic Super Joy: Groove City', 'Probability 0',
    'Bit.Trip.Runner 2 + Soundtrack + Good Friends Character Pack', 'Electronic Super Joy', 'KickBeat Steam Edition'] },
  { name: 'Humble Jumbo Bundle 2', store: 'Humble Bundle', kind: 'bundle', date: '2014-08-18', price: null, games: [
    'Deadlight', 'Galactic Civilizations II: Ultimate Edition',
    'The Incredible Adventures of Van Helsing - Complete Pack', 'Crusader Kings II',
    'Crusader Kings II: African Unit Pack', 'Crusader Kings II: Norse Unit Pack',
    'Crusader Kings II: Russian Unit Pack', 'Legend of Grimrock', 'Orcs Must Die 2 - Complete Pack', 'PixelJunk™ Eden',
    'Terraria', 'THE KING OF FIGHTERS XIII STEAM EDITION', 'Age of Empires Legacy Bundle Including The Forgotten'] },
  { name: 'Humble Weekly Bundle: Presented by Extra Credits', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-08-21', price: null, games: [
    'Enemy Mind', 'One Finger Death Punch', 'Two Brothers', 'Master Reboot', 'Stick It To The Man!',
    'Ether One Deluxe Edition', 'Hand of Fate'] },
  { name: 'Humble Flash Bundle: Modern Retro', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-08-25', price: null, games: [
    'Full Bore', 'Super Amazing Wagon Adventure', 'Tiny Barbarian DX', 'Angry Video Game Nerd Adventures',
    'NEStalgia'] },
  { name: 'Humble Weekly Bundle: Adult Swim Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-08-28', price: null, games: [
    'Fist Puncher', 'Soundodger+ and Soundtrack', 'Super Puzzle Platformer Deluxe', 'Fist Puncher Robot Unicorn DLC',
    'Soundodger+ DLC (not in use)', 'Super House of Dead Ninjas', 'Super House of Dead Ninjas: True Ninja Pack',
    'Volgarr the Viking', 'Westerado: Double Barreled Movie Set Demo', "Jazzpunk: Director's Cut", 'Super Comboman'] },
  { name: 'PAX 10 Humble Flash Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-08-28', price: null, games: [
    'Containment: The Zombie Puzzler', 'Jamestown Deluxe Pack', 'Solar 2', 'FEZ', 'The Swapper', 'Cannon Brawl',
    'Life Goes On'] },
  { name: 'Humble Weekly Bundle: Presented by Rock, Paper, Shotgun', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-09-04', price: null, games: [
    'Audiosurf', 'Dungeons of Dredmor Complete', 'World of Goo', 'AI War: Children of Neinzul', 'AI War: Fleet Command',
    'AI War: Light of the Spire', 'AI War: The Zenith Remnant', 'Amnesia: The Dark Descent',
    'Teleglitch: Die More Edition', 'Teleglitch: Guns and Tunes DLC'] },
  { name: 'Humble Flash Bundle: So Cute!', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-09-08', price: null, games: [
    'Girls Like Robots', 'Toki Tori 2+', 'Triple Town', 'Where is my Heart?', 'Woodle Tree Adventures'] },
  { name: 'Humble Indie Bundle 12', store: 'Humble Bundle', kind: 'bundle', date: '2014-09-09', price: null, games: [
    'Gunpoint', 'Hammerwatch', 'SteamWorld Dig', 'Gone Home + Original Soundtrack', 'LUFTRAUSERS', 'Monaco',
    'Papers, Please', 'Race The Sun', 'The Bridge', 'Prison Architect'] },
  { name: 'Humble Weekly Bundle: Kalypso 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-09-11', price: null, games: [
    'Airline Tycoon 2', 'Disciples III: Gold Edition', 'Grand Ages: Rome GOLD', 'Imperium Romanum: Gold Edition',
    'Patrician III', 'Patrician IV: Steam Special Edition', 'Tank Operations', 'Omerta - City of Gangsters',
    'Port Royale 3'] },
  { name: 'Humble Flash Bundle: Shmups', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-09-15', price: null, games: [
    'Really Big Sky', 'Syder Arcade', 'Aqua Kitty - Milk Mine Defender', 'Danmaku Unlimited 2',
    'Crimzon Clover  WORLD IGNITION'] },
  { name: 'Humble Valiant Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2014-09-17', price: null, games: [
    'Shadow Man'] },
  { name: 'Humble Weekly Bundle: Merge Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-09-18', price: null, games: [
    'Battle Group 2', 'Bridge Constructor Medieval', 'Deadly 30', 'Lexica', 'Commandos Collection',
    "Deadly Premonition: The Director's Cut", 'The Book of Legends', 'Meridian: New World'] },
  { name: 'Humble Flash Bundle: Yesteryear', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-09-22', price: null, games: [
    'Dangerous High School Girls in Trouble!', 'Gold Rush! Classic', 'The Ship - Complete Pack', '1849',
    '1954 Alcatraz'] },
  { name: 'Humble Bundle: PC and Android 11', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-09-23', price: null, games: [
    'Bridge Constructor Playground', 'Cubemen', 'Cubemen 2', 'Thomas Was Alone', 'Blackwell Convergence',
    'Blackwell Unbound', 'Quest of Dungeons', 'Small World', 'SpaceChem', 'The Blackwell Legacy', 'Anomaly Defenders',
    'Surgeon Simulator'] },
  { name: 'Humble Mobile Bundle 8', store: 'Humble Bundle', kind: 'bundle', date: '2014-09-24', price: null, games: [
    'Doodle God'] },
  { name: 'Humble Weekly Bundle: Leading Ladies', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-09-25', price: null, games: [
    "Defender's Quest: Valley of the Forgotten", 'Lilly Looking Through', 'Ms. Splosion Man', 'The Cat Lady',
    'Long Live The Queen', 'The Yawhg', 'Valdis Story: Abyssal City'] },
  { name: 'Humble Flash Bundle: 11 bit studios', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-09-29', price: null, games: [
    'Anomaly Warzone Earth', 'Anomaly Warzone Earth Mobile Campaign', 'Anomaly 2', 'Anomaly Korea', 'SPACECOM'] },
  { name: 'Humble Flash Bundle: KISS', store: 'Humble Bundle', kind: 'bundle', date: '2014-10-06', price: null, games: [
    'Hostile Waters: Antaeus Rising', 'Showtime!', 'The 39 Steps', 'Darkout', 'Lifeless Planet', 'Unrest'] },
  { name: 'Humble Weekly Bundle: Neko Entertainment', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-10-06', price: null, games: [
    'Crouching Pony Hidden Dragon', 'GAUGE', 'Puddle', 'The Mysterious Cities of Gold - Secret Paths', 'Poof', 'Storm',
    "Wooden Sen'SeY"] },
  { name: 'Humble Weekly Bundle: Nordic Games 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-10-07', price: null, games: [
    'AquaNox', 'AquaNox 2: Revelation', 'Black Mirror I', 'Summoner', 'Supreme Commander Gold Edition', 'Darksiders',
    'MX vs. ATV Reflex', 'Red Faction: Armageddon', 'Titan Quest Gold', 'Darksiders II', 'Deadfall Adventures',
    'SpellForce 2 - Demons of the Past'] },
  { name: 'Humble Weekly Bundle: IndieCade 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-10-09', price: null, games: [
    'Cube & Star: An Arbitrary Love', 'LYNE', 'ibb & obb', 'Proteus', 'Artemis Spaceship Bridge Simulator',
    'Mini Metro'] },
  { name: 'Humble Flash Bundle: Surprise Attack', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-10-13', price: null, games: [
    'Critical Mass', 'Party of Sin', 'Postmortem: one must die (Extended Cut)', "Zombie Tycoon 2: Brainhov's Revenge",
    'Megabyte Punch', 'OTTTD'] },
  { name: 'Humble Mozilla Bundle: Powered by asm.js', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-10-14', price: null, games: [
    'AaaaaAAaaaAAAaaAAAAaAAAAA!!! for the Awesome', 'Dustforce', 'Osmos', 'Super Hexagon', 'Zen Bound 2',
    'FTL: Faster Than Light', 'Jack Lumber', 'Democracy 3'] },
  { name: 'Humble Weekly Bundle: Vancouver Edition Presented by DigiBC', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-10-16', price: null, games: [
    'On the Rain-Slick Precipice of Darkness, Episode One', 'On the Rain-Slick Precipice of Darkness, Episode Two',
    'Shank', 'The Baconing', 'Plants vs. Zombies: Game of the Year', 'Shank 2'] },
  { name: 'Humble Flash Bundle: Extra Life', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-10-19', price: null, games: [
    "Lone Survivor: The Director's Cut", 'Potatoman Seeks the Troof', "King Arthur's Gold", 'SpeedRunners',
    "YOU DON'T KNOW JACK Classic Pack", 'PixelJunk™ Nom Nom Galaxy'] },
  { name: 'Humble Weekly Bundle: Get Your Learn On', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-10-23', price: null, games: [
    'Crazy Plant Shop', 'LUDWIG', 'Type:Rider', 'Influent', 'Sokobond', 'Contraption Maker', 'The Counting Kingdom'] },
  { name: 'Humble Flash Bundle: Boo!', store: 'Humble Bundle', kind: 'bundle', date: '2014-10-27', price: null, games: [
    'Claire', 'Zafehouse: Diaries', 'Deadly 30', 'Haunt the House: Terrortown',
    'Doorways: Chapters 1 to 3 Collection'] },
  { name: 'Humble Indie Bundle 13', store: 'Humble Bundle', kind: 'bundle', date: '2014-10-28', price: null, games: [
    'Insanely Twisted Shadow Planet', 'OlliOlli', 'Tower of Guns', 'Amnesia: A Machine for Pigs', 'Eldritch',
    "Jazzpunk: Director's Cut", 'Risk of Rain (2013)', 'Tales from Space: Mutant Blobs Attack', 'The Novelist',
    'Shadowrun Returns'] },
  { name: 'Humble Halloweekly Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2014-10-31', price: null, games: [
    'Home', 'Knock-knock', 'PAYDAY 2: Humble Mask Pack 2', 'Vertical Drop Heroes - Halloween Theme',
    'Vertical Drop Heroes HD', 'Betrayer', "Five Nights at Freddy's", 'Our Darker Purpose', 'Among the Sleep'] },
  { name: 'Humble Weekly Bundle: Racing', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-11-06', price: null, games: [
    'Real World Racing', 'Urban Trial Freestyle', 'WRC Powerslide', 'DiRT Showdown', 'Joe Danger 2: The Movie',
    'DiRT 3'] },
  { name: 'Humble Weekly Bundle: Team 17 Evolved', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-11-13', price: null, games: [
    'Alien Breed Trilogy', 'Superfrog HD', 'Worms', 'Worms Armageddon', 'Worms Blast', 'Worms Crazy Golf',
    'Worms Pinball', 'Worms Ultimate Mayhem - Deluxe Edition', 'Overruled!', 'Worms Reloaded: Game of the Year Edition',
    'Worms Revolution Gold Edition', 'Flockers', 'Worms Clan Wars'] },
  { name: 'Humble Weekly Bundle: Presented by Joystiq', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-11-20', price: null, games: [
    'Beat Hazard Mega Bundle', 'Dungeon of Elements', 'Intake', 'The Dream Machine: Chapter 4',
    'The Dream Machine: Chapters 1+2+3', 'Primal Carnage', 'Slender: The Arrival', 'Slender: The Arrival Soundtrack',
    'Costume Quest 2'] },
  { name: 'Humble Crescent Moon Mobile Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-11-24', price: null, games: [
    'Ravensword: Shadowlands', 'Paper Monsters Recut'] },
  { name: 'Humble Jumbo Bundle 3', store: 'Humble Bundle', kind: 'bundle', date: '2014-11-24', price: null, games: [
    'Always Sometimes Monsters', 'Full Mojo Rampage', 'Insurgency', 'Tesla Effect', 'Blackguards',
    'Euro Truck Simulator 2', 'GRID', 'GRID 2', 'Half Minute Hero: Super Mega Neo Climax Ultimate Boy',
    'KickBeat Steam Edition', 'Saints Row IV'] },
  { name: 'Humble SEGA Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2014-11-26', price: null, games: [
    'Dreamcast Collection (new version, includes 6 games)', 'NiGHTS into Dreams...',
    'Sonic & All-Stars Racing Transformed Collection', 'Total War: ROME II - Caesar in Gaul',
    'Company of Heroes 2 + Oberkommando West', 'Sonic Generations', 'Total War: EMPIRE - Definitive Edition',
    'Viking: Battle for Asgard', 'Total War: Shogun 2 - Fall of the Samurai'] },
  { name: 'Humble Weekly Bundle: Zen Studios 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-11-27', price: null, games: [
    'Pinball FX2 - Captain America Table', 'Pinball FX2 - Civil War Table', 'Pinball FX2 - Doctor Strange Table',
    'Pinball FX2 - Excalibur Table', 'Pinball FX2 - Mars Table',
    'Pinball FX2 : Star Wars Pinball: Balance of the Force Pack', 'Pinball FX2 - Deadpool Table',
    'Pinball FX2 - Marvel Pinball Vengeance and Virtue Pack', 'Pinball FX2 - Star Wars Pinball: Heroes Within'] },
  { name: "Humble Flash Bundle: Paradox's Giving Tuesday", store: 'Humble Bundle', kind: 'bundle',
    date: '2014-12-01', price: null, games: [
    'Darkest Hour: A Hearts of Iron Game', 'March of the Eagles', 'Sword of the Stars II: Enhanced Edition',
    'War of the Roses: Kingmaker', 'Cities in Motion 2', 'Warlock - Master of the Arcane', 'Crusader Kings II',
    'Crusader Kings II: Norse Unit Pack', 'Crusader Kings II: Russian Unit Pack'] },
  { name: 'Yogscast Jingle Jam 2014', store: 'Humble Bundle', kind: 'bundle', date: '2014-12-01', price: null, games: [
    'Awesomenauts - Demon Skølldir skin', 'Awesomenauts - Honeydew Skølldir', 'Bridge Constructor', 'Call of Juarez',
    'Cities in Motion 2 + Magicka (Yogscast package)', 'Mark of the Ninja', 'Montas', 'NiGHTS into Dreams...',
    'Strike Suit Infinity', 'Stronghold Crusader HD', 'Swords and Soldiers HD', 'Thomas Was Alone'] },
  { name: 'Humble Weekly Bundle: Simulators 3', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-12-04', price: null, games: [
    'Farming World', 'Lunar Flight', 'Post Master', 'Rescue: Everyday Heroes', 'Zoo Park',
    'Car Mechanic Simulator 2014', 'Cities in Motion 2', 'Spacebase DF-9'] },
  { name: 'Humble Weekly Bundle: Iceberg Interactive', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-12-11', price: null, games: [
    'Blades of Time', 'Nuclear Dawn', 'Star Ruler', 'The Lost Crown', 'Gas Guzzlers Extreme', 'Horizon', 'StarDrive',
    'Starpoint Gemini 2'] },
  { name: 'Humble Weekly Bundle: RPG Edition - Book I', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-12-18', price: null, games: [
    'Alpha Kimori™ Episode One', 'Avadon 2: The Corruption', 'Skara - Starter Pack', 'CONSORTIUM',
    'Deep Dungeons of Doom', 'The Forest of Doom', 'Halfway'] },
  { name: 'Humble Weekly Bundle: Games by Developers in Cold Places', store: 'Humble Bundle', kind: 'bundle',
    date: '2014-12-25', price: null, games: [
    'Bardbarian', 'Imagine Me', 'Ittle Dew', 'MURI', 'Drunken Robot Pornography', 'Race The Sun', 'Tiny Brains',
    "King's Bounty: Dark Side"] },
  { name: 'Humble Weekly Bundle: Eye Candy 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-01-01', price: null, games: [
    'Lovely Planet', 'The Blue Flamingo', 'Year Walk', 'Dust: An Elysian Tail', 'Eidolon',
    'MIND Path to Thalamus E.Edition', 'FRACT OSC'] },
  { name: 'Humble Awesome Games Done Quick 2015 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-01-04', price: null, games: [
    'Duke Nukem 3D: Megaton Edition', "Oddworld: Abe's Oddysee", 'Shadow Warrior Classic Redux', 'Volgarr the Viking',
    "Shantae: Risky's Revenge - Director's Cut", 'SpeedRunners', 'SpeedRunners - Youtuber Pack 1',
    'SpeedRunners - Youtuber Pack 2', 'Escape Goat 2'] },
  { name: 'Humble Weekly Bundle: Mastertronic', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-01-08', price: null, games: [
    'Blast Em!', 'May’s Mysteries: The Secret of Dragonville', "Montague's Mount", 'Richard & Alice', 'Speedball 2 HD',
    'The Chaos Engine', 'The Shopkeeper', '0RBITALIS', '10 Second Ninja', 'Concursion', 'Over 9000 Zombies!', 'Dream',
    'Runers', 'Tango Fiesta'] },
  { name: 'Humble Weekly Bundle: Brawlers', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-01-15', price: null, games: [
    'FIST OF AWESOME', 'Reaper - Tale of a Pale Swordsman', 'Super Comboman', 'Ascendant', 'Fist of Jesus',
    'Double Dragon Neon', 'Guacamelee! Super Turbo Championship Edition'] },
  { name: 'Humble Card Game Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2015-01-20', price: null, games: [
    'Card City Nights', 'Character Pack #5 - Martyr', 'Character Pack #6 - Gambler',
    'SolForge — Dinosaur Starter (Early Access)', 'Talisman: Digital Classic Edition', 'Talisman: Prologue',
    'Magic 2015', 'Magic 2015 Expansion', 'Magic 2015: Special Edition', 'SolForge — Starter Pack 1 (Early Access)'] },
  { name: 'Humble Weekly Bundle Je Suis Charlie', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-01-22', price: null, games: [
    'Finding Teddy', 'Type:Rider', 'FarSky', 'Strike Vector'] },
  { name: 'Humble Weekly Bundle Made In Spain', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-01-29', price: null, games: [
    'AR-K', 'Nihilumbra', 'Spy Chameleon - RGB Agent', 'Deadlight', 'Full Mojo Rampage', 'Pixel Piracy', 'Unepic'] },
  { name: 'Star Wars Humble Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2015-02-03', price: null, games: [
    'STAR WARS Jedi Knight: Jedi Academy', 'STAR WARS: Dark Forces', 'STAR WARS™ Knights of the Old Republic™',
    'Star Wars: Battlefront 2 (Classic, 2005)', 'STAR WARS Jedi Knight II: Jedi Outcast',
    'STAR WARS Jedi Knight: Dark Forces II', 'STAR WARS Knights of the Old Republic II: The Sith Lords',
    'STAR WARS Republic Commando', 'STAR WARS Starfighter', 'STAR WARS Empire at War: Gold Pack',
    'STAR WARS: The Force Unleashed II', 'STAR WARS: The Force Unleashed Ultimate Sith Edition'] },
  { name: 'Humble Weekly Bundle: Adventures!', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-02-05', price: null, games: [
    "Broken Sword 1 - Shadow of the Templars: Director's Cut", 'Broken Sword 2 - the Smoking Mirror: Remastered (2010)',
    'Detective Grimoire', 'The Whispered World + The Whispered World Special Edition', 'A Golden Wake',
    'Cognition: An Erica Reed Thriller - Season One + OST Vol 1', 'The Detail',
    "Broken Sword 5 - the Serpent's Curse"] },
  { name: 'Humble Weekly Bundle: For Lovers (of games)', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-02-12', price: null, games: [
    'Analogue: A Hate Story', 'Go! Go! Nippon! ~My First Trip to Japan~', 'Long Live The Queen', 'Hate Plus',
    'Roommates', 'WORLD END ECONOMiCA episode.01', 'Hatoful Boyfriend'] },
  { name: 'Humble Square Enix Bundle 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-02-17', price: null, games: [
    'Hitman: Absolution', 'Supreme Commander 2', "Deus Ex: Human Revolution - Director's Cut",
    'Kane and Lynch Collection', 'Lara Croft and the Guardian of Light', 'MURDERED: SOUL SUSPECT', 'Startopia', 'Thief',
    'Sleeping Dogs', 'Tomb Raider'] },
  { name: 'Humble Weekly Bundle: Co-op 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-02-19', price: null, games: [
    'Hero Siege', 'ibb & obb - Best Friends Forever Double Pack', 'Shadow Puppeteer', 'Damned', 'Hammerwatch',
    'Contagion', 'FORCED'] },
  { name: 'Humble Weekly Bundle: Made In Japan', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-02-26', price: null, games: [
    'Cherry Tree High Complete Pack', 'Fairy Bloom Freesia', 'Influent', 'Magical Battle Festa', 'REVOLVER360 RE:ACTOR',
    'The Tale of ALLTYNEX', 'Half Minute Hero: The Second Coming', 'Rime Berta'] },
  { name: 'Humble Weekly Bundle: Monochromatic', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-03-05', price: null, games: [
    'Closure', 'Dominique Pamplemousse', 'The Bridge', 'Betrayer', 'NaissanceE', 'Neverending Nightmares'] },
  { name: 'Humble PC and Android Bundle 12', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-03-17', price: null, games: [
    'Tetrobot and Co.', 'The Inner World', 'The Inner World Soundtrack', 'Titan Attacks', 'VVVVVV', 'Costume Quest',
    'Eufloria HD', 'Ironclad Tactics Deluxe Edition', 'Solar Flux', 'Toast Time', 'Shadowrun Returns'] },
  { name: 'Humble Weekly Bundle Roguelikes 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-03-19', price: null, games: [
    "A Wizard's Lizard", 'The Nightmare Cooperative', 'Vertical Drop Heroes HD', 'Delver', 'Road Not Taken',
    'Heavy Bullets'] },
  { name: 'Humble Indie Bundle 14', store: 'Humble Bundle', kind: 'bundle', date: '2015-03-31', price: null, games: [
    'Pixel Piracy', 'Super Splatters', 'Unepic', '140', 'Contraption Maker', 'La-Mulana', 'MirrorMoon EP', 'Outlast',
    'Torchlight II', 'Shadow Warrior: Special Edition'] },
  { name: 'Humble Weekly Bundle: ARGGGHHH!! (these games are hard)', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-04-02', price: null, games: [
    'Cook, Serve, Delicious!', 'QP Shooting - Dangerous!!', 'Velocibox', "Tales of Maj'Eyal", 'Woah Dave!',
    'Wings of Vi'] },
  { name: 'Humble Weekly Bundle: Tabletops', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-04-09', price: null, games: [
    'Magnifico', 'Small World 2 Complete pack', 'Talisman - The Frostmarch Expansion',
    'Talisman: Digital Classic Edition', '100% Orange Juice', '100% Orange Juice - Syura & Nanako Character Pack',
    'Catan', 'Ticket to Ride + 4 maps'] },
  { name: 'Humble Origin Bundle 2', store: 'Humble Bundle', kind: 'bundle', date: '2015-04-14', price: null, games: [
    'Dead Space 2', 'Dragon Age: Origins', 'Bejeweled 3', 'Mass Effect 2 (2010)'] },
  { name: 'Humble Weekly Bundle Strategy 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-04-16', price: null, games: [
    'Frozen Synapse Prime', 'Shattered Planet', 'Skulls of the Shogun', 'Bloodsports.TV', 'CastleStorm',
    'ENDLESS™ Space - Definitive Edition'] },
  { name: 'Humble Weekly Bundle Multiplayer Mayhem', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-04-23', price: null, games: [
    'Boid', 'God Mode', 'Primal Carnage', 'Blade Symphony + Soundtrack', 'Chariot', 'GoD Factory: Wingmen',
    'Homebrew - Patent Unknown'] },
  { name: 'Humble Might & Magic Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-04-28', price: null, games: [
    'Dark Messiah of Might & Magic', 'Might & Magic: Clash of Heroes',
    'Might & Magic: Clash of Heroes - I Am the Boss DLC', 'Heroes of Might & Magic III - HD Edition'] },
  { name: 'Humble Weekly Bundle Indie Game Magazine', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-04-30', price: null, games: [
    'ACE Founder Pack DLC', 'FarSky', 'Race The Sun', 'Fenix Rage', 'Wrack', 'Brawlhalla', 'Freedom Planet',
    'Freedom Planet - Official Soundtrack'] },
  { name: 'Humble Weekly Bundle Surprise Attack', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-05-07', price: null, games: [
    'Metrocide', 'Oscura: Lost Light', 'OTTTD', "A Druid's Duel", 'Particulars', 'Screencheat', 'Vertiginous Golf'] },
  { name: 'Humble Paradox Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2015-05-12', price: null, games: [
    'Knights of Pen and Paper +1', 'Magicka', 'Magicka Wizard Wars - Paradox Platypus Robe',
    'Magicka: Horror Props Item Pack', 'MAGICKA: THE OTHER SIDE OF THE COIN', 'Victoria II',
    'War of the Roses: Kingmaker', 'Crusader Kings II', 'Crusader Kings II: Sons of Abraham', 'Hearts of Iron III',
    'Impire', 'Sengoku', 'Ship Simulator Extremes', 'Teleglitch: Die More Edition', 'Europa Universalis IV',
    'Europa Universalis IV: Conquest of Paradise'] },
  { name: 'Humble Weekly Bundle RPG Edition Book II', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-05-14', price: null, games: [
    'bit Dungeon II', 'FATE: Hero Bundle', 'Paper Sorcerer', 'Pier Solar and the Great Architects + Soundtrack',
    'Rollers of the Realm', 'SanctuaryRPG: Black Edition', 'Agarest: Generations of War'] },
  { name: 'Humble Weekly Bundle Adventures! 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-05-21', price: null, games: [
    'Secret Files: Tunguska', 'Stacking', 'Syberia', 'The Novelist', 'Always Sometimes Monsters',
    "Broken Sword 5 - the Serpent's Curse", 'The Night of the Rabbit', 'Blackwell Epiphany',
    'The Raven: Legacy of a Master Thief Digital Deluxe Edition'] },
  { name: 'Humble Artifex Mundi Mobile Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-05-25', price: null, games: [
    'Clockwork Tales: Of Glass and Ink', 'Time Mysteries: Inheritance - Remastered',
    'Demon Hunter: Chronicles from Beyond', 'Grim Legends: The Forsaken Bride',
    'Time Mysteries 2: The Ancient Spectres', 'Time Mysteries 3: The Final Enigma',
    'Enigmatis 2: The Mists of Ravenwood', 'Grim Legends 2: Song of the Dark Swan'] },
  { name: 'Humble Weekly Bundle Relic Entertainment', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-05-28', price: null, games: [
    'COH2 - The Western Front Armies: Oberkommando West', 'Company of Heroes Complete Pack',
    'Warhammer 40,000: Dawn of War - Anniversary Edition', 'Warhammer 40,000: Dawn of War II - Anniversary Edition',
    'COH2 - The Western Front Armies: US Forces', 'Company of Heroes 2 with Standard Game DLC',
    'Warhammer 40,000: Dawn of War II - Retribution', 'Warhammer 40,000: Space Marine - Anniversary Edition',
    'Company of Heroes 2 - Ardennes Assault'] },
  { name: 'Slitherine', store: 'Humble Bundle', kind: 'bundle', date: '2015-06-04', price: null, games: [
    'Battle Academy', 'Frontline : Road to Moscow', 'Rise of Prussia Gold', 'Hell', 'Qvadriga',
    'Close Combat - Gateway to Caen'] },
  { name: 'Humble Indie Bundle All-Stars', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-06-09', price: null, games: [
    'Dustforce', 'Super Meat Boy', 'World of Goo', 'Braid', 'Dungeon Defenders Collection (Summer-Winter 2012)',
    'LIMBO', 'Antichamber', 'Risk of Rain (2013)'] },
  { name: 'Humble Weekly Bundle Retroism', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-06-11', price: null, games: [
    'Command HQ', 'F-117A Nighthawk Stealth Fighter 2.0', 'NAM', 'Pirates! Gold Plus (Classic)', 'Darklands',
    "Sid Meier's Colonization (Classic)", "Sid Meier's Covert Action (Classic)", 'Sword of the Samurai'] },
  { name: 'E3 2015 Digital Ticket', store: 'Humble Bundle', kind: 'bundle', date: '2015-06-15', price: null, games: [
    'Age of Empires II (2013): The Forgotten', 'Company of Heroes Retail',
    'Magicka: Wizard Wars - E3 Paradox Staff + Sword', 'PAYDAY 2: Humble Mask Pack 3', 'Psychonauts',
    'Cities in Motion 2', 'Total War: MEDIEVAL II - Definitive Edition'] },
  { name: 'Humble Weekly Bundle cats Cats CATS!', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-06-18', price: null, games: [
    'Aqua Kitty - Milk Mine Defender', 'Pix the Cat', "Schrödinger's Cat and the Raiders of the Lost Quark",
    'MouseCraft', 'Torchlight II', 'Hot Tin Roof: The Cat That Wore A Fedora'] },
  { name: 'Humble Borderlands Bundle 2015', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-06-23', price: null, games: [
    'Humble Borderlands Bundle 2015 - $1 tier', 'Humble Borderlands Bundle 2015 - BTA tier week1',
    'Humble Borderlands Bundle 2015 - BTA tier week2', 'Humble Borderlands Bundle 2015 - $15 tier'] },
  { name: 'Humble Weekly Bundle Eye Candy 3', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-06-25', price: null, games: [
    'Back to Bed', 'Tengami', 'Where is my Heart?', '7 Grand Steps, Step 1: What Ancients Begat', 'Deep Under the Sky',
    'Valdis Story: Abyssal City', 'The Dream Machine: Chapter 4', 'The Dream Machine: Chapter 5',
    'The Dream Machine: Chapters 1+2+3'] },
  { name: 'Humble Weekly Bundle Leading Ladies 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-07-02', price: null, games: [
    "Hack 'n' Slash", 'Lumino City', 'Trine 2 CE + Goblin Menace', 'A City Sleeps', 'The Marvellous Miss Take',
    'Gravity Ghost', 'Sunset'] },
  { name: 'Humble Game Making Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2015-07-07', price: null, games: [
    "Axis Game Factory's AGFPRO 3.0", 'GameGuru Classic', 'Labyrinthine Dreams', 'Last Word', 'Remnants of Isolation',
    'Aveyond 3-1: Lord of Twilight', "Axis Game Factory's AGFPRO - Drone Kombat FPS Multi-Player DLC",
    'Crimzon Clover  WORLD IGNITION', 'Game Character Hub', 'GameGuru - Buildings Pack', 'GameGuru - Mega Pack 1',
    'RPG Maker VX Ace', 'RPG Maker VX Ace - Luna Engine', 'Whisper of a Rose'] },
  { name: 'Humble Weekly Bundle Bohemia Interactive 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-07-09', price: null, games: [
    'Alpha Prime', 'Arma 2', 'Arma: Gold Edition', 'Original War', 'Take on Helicopters Bundle', 'The Fish Fillets 2',
    'UFO: Afterlight', 'Arma 2: Army of the Czech Republic DLC', 'Arma 2: British Armed Forces', 'Arma 2: DayZ Mod',
    'Arma 2: Operation Arrowhead', 'Arma 2: Private Military Company', 'Arma Tactics', 'Carrier Command: Gaea Mission',
    'Take On Mars', 'Bohemia Interactive Bundle 2015'] },
  { name: 'Humble Weekly Bundle Kickstarter Edition', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-07-16', price: null, games: [
    'AR-K', 'Full Bore', "Guns of Icarus Online - Collector's Edition", 'Among the Sleep', 'Retro Game Crunch',
    'Lords of Xulima', 'WARMACHINE: Tactics - Standard Edition'] },
  { name: 'Humble Jumbo Bundle 4', store: 'Humble Bundle', kind: 'bundle', date: '2015-07-21', price: null, games: [
    'Fallen Enchantress: Legendary Heroes', 'Mercenary Kings', 'Outland - Special Edition (includes Artbook and OST)',
    'Coin Crypt', 'ENDLESS™ Space - Definitive Edition', 'Freedom Planet', 'Screencheat',
    'The Incredible Adventures of Van Helsing II', 'The Stanley Parable', 'Space Engineers'] },
  { name: 'Humble Weekly Bundle Simulators 4!', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-07-23', price: null, games: [
    'Kill The Bad Guy', 'Out of the Park Baseball 15', 'Real Boxing', 'Emergency 2014', 'Gnomoria',
    'Microsoft Flight Simulator X: Steam Edition'] },
  { name: 'Humble Weekly Bundle: Games From Japan', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-07-30', price: null, games: [
    '99 Spirits - Steam Special Edition', 'Supercharged Robot VULKAISER', 'Vanguard Princess',
    'Vanguard Princess Hilda Rize', 'Vanguard Princess Lilith', 'Gurumin: A Monstrous Adventure',
    'NEO AQUARIUM - The King of Crustaceans -', 'The Sacred Tears TRUE', 'Hyperdimension Neptunia Re;Birth1'] },
  { name: 'Humble BANDAI NAMCO Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-08-04', price: null, games: [
    'DeadCore', 'PAC-MAN Championship Edition DX+ All You Can Eat Edition Bundle', 'Platformines',
    'ACE COMBAT ASSAULT HORIZON Enhanced Edition', 'Beware Planet Earth',
    'ENSLAVED: Odyssey to the West Premium Edition', 'Ridge Racer Unbounded', 'Star Trek',
    'DARK SOULS: Prepare To Die Edition'] },
  { name: 'Humble Weekly Bundle The Return of Space Boy', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-08-13', price: null, games: [
    'ROCKETSROCKETSROCKETS', 'StarMade', 'Steam Marines', 'Edge of Space',
    'Interplanetary + Interplanetary: Enhanced Edition (38142)', 'STARWHAL', 'Reassembly'] },
  { name: 'Humble PC and Android Bundle 13', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-08-18', price: null, games: [
    'Beatbuddy: Tale of the Guardians', 'Crimsonland', 'FOTONICA', 'Neverending Nightmares', 'Crowntakers',
    'Doodle God', 'Monster Loves You!', 'Secret of the Magic Crystals Complete', 'Strata', 'TinyKeep'] },
  { name: 'Humble Weekly Bundle Might and Magic', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-08-20', price: null, games: [
    'Dark Messiah of Might & Magic', 'Might & Magic: Clash of Heroes',
    'Might & Magic: Clash of Heroes - I Am the Boss DLC', 'Heroes of Might & Magic III - HD Edition'] },
  { name: 'Humble Weekly Bundle Rising Star Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-08-27', price: null, games: [
    "Deadly Premonition: The Director's Cut", 'The Marvellous Miss Take', 'Tulpa', 'Cloudbuilt', 'Kromaia',
    'Ratz Instagib 2.0', 'TRI: Of Friendship and Madness'] },
  { name: 'Humble Weekly Bundle: Merge Games & Friends', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-09-03', price: null, games: [
    'Albedo: Eyes from Outer Space', 'Meridian: New World', 'Pixel Heroes: Byte & Magic',
    'Zombie Kill of the Week - Reborn', 'Coffin Dodgers', 'Enforcer: Police Crime Action', 'Victory At Sea'] },
  { name: 'Humble Weekly Bundle Super Slam Showdown', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-09-10', price: null, games: [
    'No Time To Explain Remastered', 'Phantom Breaker: Battle Grounds', 'Stardust Vanguards', 'Divekick',
    'Robot Roller-Derby Disco Dodgeball', 'Sportsfriends'] },
  { name: 'Humble Total War Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2015-09-15', price: null, games: [
    'Shogun: Total War Collection, Medieval II: Total War Collection, Viking: Battle for Asgard, and Total War: ARENA Beta Access Key',
    'Empire: Total War Collection and MEDIEVAL: Total War Collection', 'Napoleon: Total War Collection (17273)',
    'Shogun 2 Collection Nov 2012', 'Humble 2015 Total War Bundle tier $15'] },
  { name: 'Humble Weekly Bundle: Play and Create with GameMaker', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-09-17', price: null, games: [
    'Another Perspective', 'Death Ray Manta', 'Spoiler Alert', '10 Second Ninja',
    'Detective Case and Clown Bot in: Murder in the Hotel Lisbon', 'GameMaker: Studio Professional package',
    'Savant - Ascent (incl. Savant - Ascent REMIX)', 'Stealth Bastard Deluxe', 'GameMaker: Studio Android'] },
  { name: 'Humble Weekly Bundle Fantastic Arcade', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-09-24', price: null, games: [
    'Wheels of Aurelia', 'FEZ', 'FRACT OSC', 'Hotline Miami', 'LUFTRAUSERS', 'MirrorMoon EP'] },
  { name: 'Humble Indie Bundle 15', store: 'Humble Bundle', kind: 'bundle', date: '2015-09-29', price: null, games: [
    'Goodbye Deponia', "Q.U.B.E: Director's Cut", 'Sir, You Are Being Hunted', 'Chaos on Deponia', 'Deponia',
    'Gone Home + Original Soundtrack', 'Planetary Annihilation', 'Skullgirls + All Characters and Color Palette Bundle',
    'Xenonauts', 'Gang Beasts'] },
  { name: 'Humble Weekly Bundle Nordic Games 3', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-10-08', price: null, games: [
    'Chaser', 'Jagged Alliance Gold', 'Silent Storm', 'SuperPower 2 Steam Edition', 'Black Mirror I', 'Black Mirror II',
    'Black Mirror III', 'Desperados - Wanted Dead or Alive', 'Desperados 2: Cooper’s Revenge', 'MX vs. ATV Unleashed',
    'Red Faction: Guerrilla Steam Edition', 'The Book of Unwritten Tales 2'] },
  { name: 'Humble Capcom Bundle 2015', store: 'Humble Bundle', kind: 'bundle', date: '2015-10-13', price: null, games: [
    'Bionic Commando Rearmed', 'Lost Planet 3', 'Resident Evil Revelations 2', 'Strider', 'DmC Devil May Cry',
    'Remember Me', 'Resident Evil 4 (2005)', 'Resident Evil 5', 'Resident Evil Revelations',
    'Resident Evil 5 - UNTOLD STORIES BUNDLE', 'Ultra Street Fighter IV'] },
  { name: "Humble Weekly Bundle Valentine's Day 2", store: 'Humble Bundle', kind: 'bundle',
    date: '2015-10-15', price: null, games: [
    'Asphyxia', 'Hatoful Boyfriend', 'Loren the Amazon Princess - Deluxe Version', 'Sakura Spirit',
    'The Confines Of The Crown', 'TyranoBuilder Visual Novel Studio', 'WORLD END ECONOMiCA episode.02'] },
  { name: 'Humble Weekly Bundle Games Workshop', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-10-22', price: null, games: [
    'Chainsaw Warrior', 'Chainsaw Warrior: Lords of the Night', 'Talisman - The Frostmarch Expansion',
    'Talisman: Digital Classic Edition', 'Warhammer 40,000: Kill Team', "Character Pack #3 - Devil's Minion",
    'Character Pack #7 - Black Witch', 'Space Hulk - Ultimate Pack', 'Talisman - The Reaper Expansion',
    'Warhammer 40,000: Dawn of War II - Retribution - Last Stand DLC', 'Warhammer Quest'] },
  { name: 'Humble Jumbo Bundle 5', store: 'Humble Bundle', kind: 'bundle', date: '2015-10-27', price: null, games: [
    'Abyss Odyssey', 'Insurgency', 'Men of War: Assault Squad - Game of the Year Edition', 'A Story About My Uncle',
    'Blackguards', 'Blackguards 2', 'Citizens of Earth', 'Contagion', 'Euro Truck Simulator 2', 'Teslagrad',
    'Divinity: Dragon Commander', 'Spintires'] },
  { name: 'Humble Weekly Bundle: Day of the Devs', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-10-29', price: null, games: [
    'Costume Quest', "Hack 'n' Slash", 'Lumino City', 'Escape Goat 2', 'Mercenary Kings', 'Grim Fandango Remastered',
    'MASSIVE CHALICE'] },
  { name: 'Humble Weekly Bundle extra life', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-11-04', price: null, games: [
    'How to Survive', "Jazzpunk: Director's Cut", 'Overlord', 'How To Survive Third Person',
    'It came from space and ate our brains', 'Overlord II', 'Shadowgate', 'Shadowgate: MacVenture Series',
    'Secret Ponchos'] },
  { name: 'Humble Weekly Bundle Made In Singapore', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-11-12', price: null, games: [
    'Cubetractor', 'Rocketbirds: Hardboiled Chicken', "Devil's Dare + Streets of Red : Devil's Dare Deluxe",
    'Dusty Revenge', 'Ravenmark: Scourge of Estellion', 'Holy Potatoes! A Weapon Shop?!'] },
  { name: 'Humble Weekly Bundle Japan All-Stars', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-11-19', price: null, games: [
    'One Way Heroics', 'Unholy Heights', 'Vanguard Princess', 'Vanguard Princess Hilda Rize',
    'Vanguard Princess Kurumi', 'Vanguard Princess Lilith', 'Astebreed: Definitive Edition',
    'Gurumin: A Monstrous Adventure', 'Mitsurugi Kamui Hikae', 'REVOLVER360 RE:ACTOR'] },
  { name: 'Humble Codemasters Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2015-11-24', price: null, games: [
    'Colin McRae Rally', 'DiRT Showdown', 'GRID 2', 'GRID 2 Drift Pack', 'Hospital Tycoon',
    'Operation Flashpoint: Dragon Rising', 'Operation Flashpoint: Red River', 'Overlord', 'GRID',
    'GRID 2 Spa-Francorchamps Track Pack', 'GRID Autosport', 'GRID Autosport - Drag Pack',
    'GRID Autosport - Road & Track Car Pack', 'Overlord II', 'Overlord: Raising Hell', 'Rise of the Argonauts'] },
  { name: 'Humble Weekly Bundle Team17 The Threequel', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-11-26', price: null, games: [
    'Alien Breed Trilogy', 'Light', 'Worms', 'Worms Armageddon', 'Worms Crazy Golf', 'Flockers',
    "Schrödinger's Cat and the Raiders of the Lost Quark", 'Worms Reloaded', 'Worms Revolution Gold Edition',
    'Beyond Eyes', 'LA Cops', 'Worms Clan Wars'] },
  { name: 'Yogscast Jingle Jam 2015', store: 'Humble Bundle', kind: 'bundle', date: '2015-12-01', price: null, games: [
    'Ace of Spades', 'Awesomenauts', 'Awesomenauts - Demon Skølldir skin', 'Block N Load - 560 Platinum Bar Pack',
    'Chivalry: Medieval Warfare', 'DEFCON', 'DiscStorm', 'Gang Beasts - Yogscast Charity Drive 2015', "Garry's Mod",
    'Gunpoint', 'Guns of Icarus Online', 'Rust', 'Tango Fiesta', 'The Weaponographist', 'Torchlight II'] },
  { name: 'Humble Weekly Bundle Gambitious', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-12-03', price: null, games: [
    'Breach & Clear', 'Hard Reset', 'Mutant Mudds Deluxe', 'Breach & Clear: Deadline Rebirth (2016)',
    'Magnetic: Cage Closed', 'Xeodrifter™ Special Edition', 'Train Fever'] },
  { name: 'Humble NEOGEO Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2015-12-08', price: null, games: [
    'BASEBALL STARS 2', 'METAL SLUG 2', 'METAL SLUG', 'METAL SLUG 3', 'SHOCK TROOPERS',
    "THE KING OF FIGHTERS '98 ULTIMATE MATCH FINAL EDITION", 'THE LAST BLADE', 'TWINKLE STAR SPRITES', 'METAL SLUG X',
    'SHOCK TROOPERS 2nd Squad', 'THE KING OF FIGHTERS 2002 UNLIMITED MATCH'] },
  { name: 'Humble Weekly Bundle Total War Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-12-10', price: null, games: [
    'Shogun: Total War Collection, Medieval II: Total War Collection, Viking: Battle for Asgard, and Total War: ARENA Beta Access Key',
    'Empire: Total War Collection and MEDIEVAL: Total War Collection', 'Napoleon: Total War Collection (17273)',
    'Shogun 2 Collection Nov 2012', 'Humble 2015 Total War Bundle tier $15'] },
  { name: 'Humble Weekly Bundle Sports!', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-12-17', price: null, games: [
    'Max Gentlemen - Triple DLC Pack', 'OlliOlli', 'Qvadriga', 'Sportsfriends', 'Vertiginous Golf',
    'WRC 4 FIA WORLD RALLY CHAMPIONSHIP', 'Out of the Park Baseball 16'] },
  { name: 'Humble Square Enix Bundle 3', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-12-22', price: null, games: [
    'Life is Strange', 'MURDERED: SOUL SUSPECT', 'The Last Remnant', 'Tomb Raider I', 'Tomb Raider II',
    'Tomb Raider III: Adventures of Lara Croft', 'Front Mission Evolved', 'Gyromancer',
    'Just Cause 1 + 2 + DLC Collection', 'Tomb Raider: Anniversary', 'Tomb Raider: Legend', 'Tomb Raider: Underworld',
    'Yosumin!', 'Hitman Absolution: Elite Edition', 'Lara Croft and the Temple of Osiris'] },
  { name: 'Humble Weekly Bundle Eye Candy 4', store: 'Humble Bundle', kind: 'bundle',
    date: '2015-12-24', price: null, games: [
    'Dyscourse', 'Lumino City', 'Plug & Play', '2064: Read Only Memories', 'Apotheon', 'The Next Penelope',
    "D4: Dark Dreams Don't Die"] },
  { name: 'Humble Weekly Bundle Full Motion Video', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-01-14', price: null, games: [
    '7th Guest & 11th Hour Bundle', 'MISSING: An Interactive Thriller - Episode One', 'Tesla Effect',
    'Tex Murphy Classic Collection', 'Her Story', 'Roundabout'] },
  { name: 'Humble Firaxis Games Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-01-19', price: null, games: [
    '2K Humble Bundle 2016 $1+ Tier', '2K Humble Bundle 2016 BTA Tier', '2K Humble Bundle 2016 MPA',
    '2K Humble Bundle 2016 BT$15 Tier'] },
  { name: 'Humble Weekly Bundle Focus 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-01-28', price: null, games: [
    'Final Exam', 'Mars: War Logs', 'Pix the Cat', 'Space Run', 'Yesterday', 'Bound By Flame', 'Cities XL Platinum',
    'Contrast', 'Etherium', 'Game of Thrones', 'Wargame: European Escalation', 'Blood Bowl: Chaos Edition',
    'Cities XXL', 'Farming Simulator 2013', 'Of Orcs And Men', 'Styx: Master of Shadows'] },
  { name: 'Humble Ubisoft Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2016-02-02', price: null, games: [
    'Call of Juarez Gunslinger', 'Grow Home'] },
  { name: 'Humble Weekly Bundle Make Your Move', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-02-04', price: null, games: [
    'Frozen Cortex', 'Frozen Synapse', 'Lux Delux', 'Shattered Planet', 'Reassembly', 'The Last Federation',
    'The Last Federation - Betrayed Hope', 'Big Pharma', 'Chaos Reborn'] },
  { name: 'Humble Gamepedia Online Multiplayer Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-02-16', price: null, games: [
    'Awesomenauts', 'Humble Bundle Pack', 'Vertiginous Golf 4 Pack', 'War of the Vikings',
    'Life is Feudal: Your Own'] },
  { name: 'Humble Weekly Bundle Orbyt Play', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-02-18', price: null, games: [
    'Divekick', 'INK', 'SpeedRunners', 'Dead State', 'Grim Fandango Remastered', 'Party Hard'] },
  { name: 'Humble Indie Bundle 16', store: 'Humble Bundle', kind: 'bundle', date: '2016-02-23', price: null, games: [
    'Never Alone (Kisima Ingitchuna)', 'Never Alone: Foxtales', 'Outlast', 'Retro City Rampage DX', 'Door Kickers',
    'Duet', 'FORCED', 'Trine 3: The Artifacts of Power', 'Else Heart.Break()', 'Sunless Sea'] },
  { name: 'Humble Weekly Bundle Iceberg Interactive 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-02-25', price: null, games: [
    'Armada 2526 Gold Edition', 'Darkness Within: In Pursuit of Loath Nolder', 'Gas Guzzlers Extreme', 'Nuclear Dawn',
    'Tiny Troopers', "Darkness Within 2: The Dark Lineage Director's Cut Edition",
    'Gas Guzzlers Extreme: Full Metal Frenzy', 'Gas Guzzlers Extreme: Full Metal Zombie', 'Inside My Radio',
    'Vector Thrust', 'Starpoint Gemini 2'] },
  { name: 'Star Wars Humble Bundle 2', store: 'Humble Bundle', kind: 'bundle', date: '2016-03-01', price: null, games: [
    'STAR WARS Galactic Battlegrounds Saga', 'STAR WARS Rebellion',
    'STAR WARS X-Wing vs TIE Fighter: Balance of Power Campaigns', 'STAR WARS: X-Wing Alliance',
    'Star Wars: Battlefront 2 (Classic, 2005)', 'STAR WARS Jedi Knight: Dark Forces II',
    'STAR WARS Knights of the Old Republic II: The Sith Lords', 'STAR WARS: Dark Forces',
    'STAR WARS: TIE Fighter Special Edition', 'STAR WARS: X-Wing Special Edition',
    'STAR WARS™ Knights of the Old Republic™', 'LEGO Star Wars: The Complete Saga',
    'STAR WARS Empire at War: Gold Pack'] },
  { name: 'Humble Weekly Bundle Zen Studios 3', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-03-03', price: null, games: [
    'Pinball FX2 - Guardians of the Galaxy Table', 'pinball FX2 - Iron & Steel Pack',
    "Pinball FX2 - Marvel's Avengers: Age of Ultron", 'Pinball FX2 - Super League - Zen Studios F.C. Table',
    'Pinball FX2 - Venom Table', 'Pinball FX2 : Star Wars Pinball: Balance of the Force Pack',
    'Pinball FX2 - Civil War Table', "Pinball FX2 - Marvel's Ant-Man",
    'Pinball FX2 - Star Wars Pinball: Star Wars Rebels', 'Pinball FX2 - The Walking Dead Table'] },
  { name: 'Humble Jumbo Bundle 6', store: 'Humble Bundle', kind: 'bundle', date: '2016-03-08', price: null, games: [
    'Oceanhorn: Monster of Uncharted Seas', 'Shadowrun Chronicles - Boston Lockdown',
    'WARMACHINE: Tactics - Mercenaries Faction Bundle', 'WARMACHINE: Tactics - Standard Edition', 'Dreamfall Chapters',
    'Holy Potatoes! A Weapon Shop?!', 'Magicka 2', 'Shadowrun Returns', "Shadowrun: Dragonfall - Director's Cut",
    'TransOcean: The Shipping Company', 'Grey Goo Definitive Edition'] },
  { name: 'Humble CRYENGINE Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2016-03-15', price: null, games: [
    'Nexuiz'] },
  { name: 'Humble SEGA Strategy Bundle 2016', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-03-22', price: null, games: [
    'HB Strategy 2016 - Core Tier', 'HB Strategy 2016 - BTA Tier', 'HB Strategy 2016 - $12 Tier'] },
  { name: 'Humble Staff Picks Bundle: Glen', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-04-05', price: null, games: [
    'Brothers - A Tale of Two Sons', 'Chivalry: Medieval Warfare', 'Ultimate General: Gettysburg',
    'Fahrenheit: Indigo Prophecy Remastered', 'GRAV', 'Knight Squad', 'Tropico 5', 'Victor Vran',
    'Homeworld Remastered Collection'] },
  { name: 'Humble Telltale Bundle (2016)', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-04-12', price: null, games: [
    'Back to the Future: The Game', 'Poker Night at the Inventory (2010)', 'Puzzle Agent', 'Puzzle Agent 2',
    "Sam & Max: The Devil's Playhouse", 'The Walking Dead', 'Jurassic Park: The Game', 'Poker Night 2',
    "Strong Bad's Cool Game for Attractive People: Season 1", 'Tales from the Borderlands',
    'The Walking Dead: 400 Days', 'The Wolf Among Us', 'Game of Thrones - A Telltale Games Series',
    'The Walking Dead: Season Two'] },
  { name: 'Humble Devolver Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2016-04-19', price: null, games: [
    'A Fistful of Gun', 'Gods Will Be Watching', 'RONIN', 'Dropsy', 'Noct', 'NOT A HERO',
    'OlliOlli2: Welcome to Olliwood', 'Shadow Warrior: Special Edition', 'Hatoful Boyfriend: Holiday Star',
    'Titan Souls'] },
  { name: 'Humble Eye Candy Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2016-05-03', price: null, games: [
    'A Boy and His Blob', 'Human Resource Machine', "Shantae: Risky's Revenge - Director's Cut", 'Mini Metro',
    'Mushroom 11', 'TowerFall Ascension', 'Evoland 2'] },
  { name: 'Capcom Super Turbo HD Remix ReBundle 2016', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-05-10', price: null, games: [
    'Bionic Commando Rearmed', 'Lost Planet 3 - Complete Pack', 'Resident Evil Revelations 2', 'Strider',
    'Bionic Commando', 'DmC Devil May Cry', "DmC Devil May Cry: Vergil's Downfall", 'Remember Me',
    'Resident Evil 4 (2005)', 'Resident Evil Revelations', 'Devil May Cry 4 Special Edition', 'Resident Evil 6'] },
  { name: 'Humble Deep Silver Bundle 2 (2016)', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-05-17', price: null, games: [
    'Dead Island: Game of the Year Edition', 'Risen', 'Risen 2: Dark Waters Gold Edition', 'Sacred 3 Gold',
    'Saints Row 2', 'Dead Island Riptide Complete Edition', 'Killer is Dead',
    'Saints Row: The Third - The Full Package', 'Risen 3 - Titan Lords', 'Saints Row IV'] },
  { name: 'Humble Ubisoft Bundle Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-05-24', price: null, games: [
    'Call of Juarez Gunslinger', 'Grow Home'] },
  { name: 'Humble Narrative Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2016-05-31', price: null, games: [
    '2064: Read Only Memories', 'Cibele', 'Her Story', '80 Days', 'Broken Age', 'Sorcery! Parts 1 & 2',
    'Shadowrun: Hong Kong - Extended Edition'] },
  { name: 'Humble Staff Picks Bundle: Hamble', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-06-07', price: null, games: [
    '1001 Spikes', 'Absolute Drift', 'Snakebird', 'Bulb Boy', 'Deathtrap', 'Hand of Fate', 'Soul Axiom',
    'Craft The World', 'Viscera Cleanup Detail - House of Horror',
    "Viscera Cleanup Detail +VCD: Santa's Rampage +VCD Shadow Warrior"] },
  { name: 'E3 2016 Digital Ticket', store: 'Humble Bundle', kind: 'bundle', date: '2016-06-13', price: null, games: [
    'First Assault Exclusive E3 Digital Ticket Bundle package', 'Mountain', 'Psychonauts',
    'SUPERFIGHT - The Joiner Micro Deck', 'SUPERFIGHT for Beta Testing', 'Grey Goo Definitive Edition',
    'SMITE — Bellona and Furiona Bellona Exclusive Skin, Kukulkan and Typhoon Kukulkan skin'] },
  { name: 'Humble NEO GEO Bundle Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-06-20', price: null, games: [
    'BASEBALL STARS 2', 'METAL SLUG 2', 'METAL SLUG', 'METAL SLUG 3', 'SHOCK TROOPERS',
    "THE KING OF FIGHTERS '98 ULTIMATE MATCH FINAL EDITION", 'THE LAST BLADE', 'TWINKLE STAR SPRITES', 'METAL SLUG X',
    'SHOCK TROOPERS 2nd Squad', 'THE KING OF FIGHTERS 2002 UNLIMITED MATCH'] },
  { name: 'Humble Sonic the Hedgehog 25th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-06-21', price: null, games: [
    'Humble Sonic 25th Anniversary Bundle $1 tier', 'Humble Sonic 25th Anniversary Bundle BTA tier week1',
    'Humble Sonic 25th Anniversary Bundle BTA tier week2', 'Humble Sonic 25th Anniversary Bundle $10 tier'] },
  { name: 'Humble PC and Android Bundle 14', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-06-28', price: null, games: [
    '10,000,000', 'BADLAND: Game of the Year Deluxe Edition', 'SPACECOM', 'Asdivine Hearts',
    'Knights of Pen and Paper +1', 'Please, Don’t Touch Anything', 'Spider: Rite of the Shrouded Moon', 'Unmechanical',
    'You Must Build A Boat', 'Desktop Dungeons', 'Knights of Pen and Paper 2'] },
  { name: 'Humble Summer Games Done Quick 2016 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-07-03', price: null, games: [
    'Dustforce', 'Escape Goat 2', 'Freedom Planet', 'Guacamelee! Gold Edition', 'Serious Sam Double D XXL',
    'Serious Sam: The Random Encounter', 'Super Meat Boy', 'VVVVVV'] },
  { name: 'Humble Bundle Revelmode', store: 'Humble Bundle', kind: 'bundle', date: '2016-07-12', price: null, games: [
    'Choice Chamber', 'Nidhogg', 'Robot Roller-Derby Disco Dodgeball', 'Golf With Your Friends', 'Roguelands',
    'Skullgirls + All Characters and Color Palette Bundle', 'Spelunky', 'Rocket League'] },
  { name: 'Humble 2K Bundle 2', store: 'Humble Bundle', kind: 'bundle', date: '2016-07-19', price: null, games: [
    'Duke Nukem Forever', 'Spec Ops: The Line', 'The Darkness II', 'Freedom Force', 'Freedom Force vs. the 3rd Reich',
    "Mafia II: Director's Cut - 2016", 'NBA 2K16', 'Railroad Tycoon 3', "Sid Meier's Civilization V",
    'The Bureau: XCOM Declassified', 'Battleborn: Full Game', 'Borderlands: The Pre-Sequel'] },
  { name: 'Humble Survive This Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-08-09', price: null, games: [
    'KHOLAT', 'Savage Lands', 'Tharsis', 'Rust', 'Shelter 2', 'Space Engineers', 'Planetbase'] },
  { name: 'Humble Indie Bundle 17', store: 'Humble Bundle', kind: 'bundle', date: '2016-08-16', price: null, games: [
    'GALAK-Z', 'Lethal League', "The Beginner's Guide", 'Expand', 'Hexcells Complete Pack',
    'Lovers in a Dangerous Spacetime', 'Octodad: Dadliest Catch', 'Regency Solitaire', 'Super Time Force Ultra',
    'Nuclear Throne'] },
  { name: 'Humble Sierra Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2016-08-30', price: null, games: [
    'Phantasmagoria', 'Phantasmagoria 2', 'Police Quest Collection', 'Shiftlings', 'Space Quest Collection', 'Arcanum',
    'Gabriel Knight 2: The Beast Within', 'Gabriel Knight 3: Blood of the Sacred, Blood of the Damned',
    'Gabriel Knight: Sins of the Fathers', 'Quest for Glory Collection', 'TimeShift', 'Caesar 3', 'Caesar 4',
    'Geometry Wars 3: Dimensions Evolved', "King's Quest Collection", 'Velocity 2X'] },
  { name: 'GameMaker Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2016-09-06', price: null, games: [
    'Cook, Serve, Delicious!', 'GameMaker: Studio Full package', 'GameMaker: Studio Mac OS X',
    'GameMaker: Studio Professional package', 'GameMaker: Studio Ubuntu Export', 'INK', 'Uncanny Valley',
    'GameMaker: Studio HTML5', 'Home', 'Solstice', 'GameMaker: Studio Android', 'GameMaker: Studio iOS'] },
  { name: 'Humble Artifex Mundi PC & Mobile Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-09-19', price: null, games: [
    'Dark Heritage: Guardians of Hope', 'The Secret Order 2: Masked Intent',
    'Vampire Legends: The True Story of Kisilova', 'Crime Secrets: Crimson Lily', 'Eventide: Slavic Fable',
    'Grim Legends 2: Song of the Dark Swan', 'Grim Legends: The Forsaken Bride', 'The Secret Order 3: Ancient Times',
    'Grim Legends 3: The Dark City', "Mythic Wonders: The Philosopher's Stone"] },
  { name: 'Humble Jumbo Bundle 7', store: 'Humble Bundle', kind: 'bundle', date: '2016-09-20', price: null, games: [
    'Devil Daggers', 'RollerCoaster Tycoon 2: Triple Thrill Pack', 'Runestone Keeper',
    'Agatha Christie - The ABC Murders', 'Elegy For A Dead World', 'Prison Architect', 'Punch Club',
    'Road to Ballhalla', 'Stronghold Crusader 2', 'Miscreated'] },
  { name: 'Humble Clickteam Fusion 2.5 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-09-27', price: null, games: [
    'Clickteam Fusion 2.5', 'Necromonads', 'Oniken', 'Plantera', 'Tick Tock Isle', "Five Nights at Freddy's 3",
    'Quadle', 'room13', 'The Yawhg', 'UWP Exporter for Clickteam Fusion 2.5',
    'Android Exporter for Clickteam Fusion 2.5', 'Clickteam Fusion 2.5 Developer Upgrade', 'Concrete Jungle',
    'Environmental Station Alpha', 'HTML5 Exporter for Clickteam Fusion 2.5',
    'iOS Exporter for Clickteam Fusion 2.5'] },
  { name: 'Humble Company Of Heroes 10th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-10-04', price: null, games: [
    'Humble Company Of Heroes 10th Anniversary Bundle $1 tier',
    'Humble Company Of Heroes 10th Anniversary Bundle BTA tier', 'Company of Heroes 2 -10th Anniversary Skin Pack',
    'Humble Company Of Heroes 10th Anniversary Bundle $10 tier'] },
  { name: 'Humble Gems Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2016-10-25', price: null, games: [
    'Chroma Squad', 'Odallus: The Dark Call', 'Technobabylon', 'Assault Android Cactus', 'Spaera',
    'Westerado: Double Barreled', 'Unbox'] },
  { name: 'Humble Day of the Devs 2016 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-10-29', price: null, games: [
    'Broken Age', 'Lumino City', 'Titan Souls', 'Grim Fandango Remastered', 'MASSIVE CHALICE', 'Oxenfree',
    'Day of the Tentacle Remastered'] },
  { name: 'Humble Lifehacker Software Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-11-01', price: null, games: [
    'DisplayFusion'] },
  { name: 'Humble Unreal Engine Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-11-08', price: null, games: [
    'Dangerous Golf', 'Killing Floor', 'Killing Floor - Chickenator DLC', 'Killing Floor - Community Weapon Pack 1',
    'Killing Floor - Community Weapon Pack 2',
    'Killing Floor - Community Weapons Pack 3 - Us Versus Them Total Conflict Pack', 'Shadow Complex Remastered',
    'ADR1FT', 'The Mean Greens - Plastic Warfare', 'The Vanishing of Ethan Carter + Redux', 'The Culling'] },
  { name: 'Humble Staff Picks Bundle: Nick', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-11-22', price: null, games: [
    'Legend of Grimrock 2', 'TIS-100', 'Volume', 'Dungeons 2', 'Infinifactory', 'Secret World Legends', 'Grim Dawn'] },
  { name: 'Humble Tycoon Simulator Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-11-29', price: null, games: [
    'Out of the Park Baseball 17', 'RollerCoaster Tycoon: Deluxe', 'Train Simulator 2016 Humble Bundle package',
    'Big Pharma', 'Car Mechanic Simulator 2015', "Democracy 3 Collector's Edition", 'Youtubers Life'] },
  { name: 'Yogscast Jingle Jam 2016', store: 'Humble Bundle', kind: 'bundle', date: '2016-12-01', price: null, games: [
    'Anomaly 2', 'Back to Bed', 'Battlerite - Charity 1', 'Binary Domain Collection', 'BiT Evolution',
    'BIT.TRIP Presents... Runner2: Future Legend of Rhythm Alien',
    'Bohemian Killing - Original Soundtrack and Artbooks', 'Botanicula', 'Chivalry: Medieval Warfare', 'Choplifter HD',
    'Chronology', 'Cosmonautica', 'Crusaders of the Lost Idols - Legendary Starter Pack', "Curses 'N Chaos",
    'Dark Scavenger', 'Deep Dungeons of Doom'] },
  { name: 'Humble Sierra Bundle: strikes again!', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-12-20', price: null, games: [
    'Phantasmagoria', 'Phantasmagoria 2', 'Police Quest Collection', 'Shiftlings', 'Space Quest Collection', 'Arcanum',
    'Gabriel Knight 2: The Beast Within', 'Gabriel Knight 3: Blood of the Sacred, Blood of the Damned',
    'Gabriel Knight: Sins of the Fathers', 'Quest for Glory Collection', 'TimeShift', 'Caesar 3', 'Caesar 4',
    'Geometry Wars 3: Dimensions Evolved', "King's Quest Collection", 'Velocity 2X'] },
  { name: 'Humble GameDev Software Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2016-12-27', price: null, games: [
    'Clickteam Fusion 2.5', 'Spriter Pro', 'Spriter: Game Effects Pack', 'HTML5 Exporter for Clickteam Fusion 2.5',
    'Marmoset Hexels 3', 'Spriter: Adventure Platformer Pack', 'Spriter: Basic Platformer Pack',
    "Spriter: Run N' Gun Pack", 'Spriter: Radius-Wing SHMUP Animated Art Pack', 'Spriter: RPG Heroes Pack'] },
  { name: 'Humble Overwhelmingly Positive Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-01-10', price: null, games: [
    'Epic Battle Fantasy 4', 'Pony Island', "Shantae and the Pirate's Curse", 'Bit Blaster XL',
    'Day of the Tentacle Remastered', 'DEADBOLT', 'Refunct', 'N++', 'VA-11 Hall-A: Cyberpunk Bartender Action'] },
  { name: "Humble Bundle's: Best of 2016", store: 'Humble Bundle', kind: 'bundle',
    date: '2017-01-17', price: null, games: [
    'Else Heart.Break()', 'Evoland 2', 'Victor Vran', 'Rust', 'Shadowrun: Hong Kong - Extended Edition',
    'Stronghold Crusader 2', 'Homeworld Remastered Collection'] },
  { name: 'Humble Starbreeze Bundle: Presents John Wick', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-01-26', price: null, games: [
    'PAYDAY 2', 'PAYDAY 2: Humble Mask Pack 2', 'PAYDAY 2: John Wick Weapon Pack', 'PAYDAY 2: The Bomb Heists',
    'PAYDAY 2: GOTY Edition 2016', 'PAYDAY 2: Humble Mask Pack', 'PAYDAY 2: Humble Mask Pack 3',
    'PAYDAY 2: Humble Mask Pack 5', 'Dead by Daylight', 'John Wick Chronicles', 'John Wick'] },
  { name: 'Humble BANDAI NAMCO Bundle 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-01-31', price: null, games: [
    'ACE COMBAT ASSAULT HORIZON Enhanced Edition', 'ENSLAVED: Odyssey to the West Premium Edition', 'PAC-MAN 256',
    'ARCADE GAME SERIES 3-in-1 Pack', 'Attractio', 'NARUTO SHIPPUDEN: Ultimate Ninja STORM 3 Full Burst',
    'Project CARS', 'Warhammer 40,000: Eternal Crusade + 2 DLCs', 'Project CARS On-Demand DLC Pack',
    'Tales of Zestiria', 'Little Nightmares'] },
  { name: 'Star Wars Humble Bundle III', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-02-07', price: null, games: [
    'STAR WARS Galactic Battlegrounds Saga', 'STAR WARS X-Wing vs TIE Fighter: Balance of Power Campaigns',
    'STAR WARS: X-Wing Alliance', 'STAR WARS™ Knights of the Old Republic™', 'Star Wars: Battlefront 2 (Classic, 2005)',
    'STAR WARS Jedi Knight II: Jedi Outcast', 'STAR WARS Knights of the Old Republic II: The Sith Lords',
    'STAR WARS Starfighter', 'STAR WARS: Rebel Assault I + II', 'STAR WARS Empire at War: Gold Pack',
    'STAR WARS: Rogue Squadron 3D', 'STAR WARS: Shadows of the Empire', 'STAR WARS: The Force Unleashed II',
    'STAR WARS: The Force Unleashed Ultimate Sith Edition'] },
  { name: 'Humble Freedom Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2017-02-14', price: null, games: [
    '2064: Read Only Memories', '7 Grand Steps, Step 1: What Ancients Begat', 'A Virus Named TOM',
    'AI War: Fleet Command', 'Ballistick', 'Beat Hazard Mega Bundle', 'Chroma Squad',
    'Dangerous High School Girls in Trouble!', 'Day of the Tentacle Remastered', 'Double Fine Adventure package',
    'Dusty Revenge', 'Ellipsis', 'Girls Like Robots', 'GRAV', 'Guacamelee! Gold Edition',
    'Guacamelee! Super Turbo Championship Edition'] },
  { name: 'Humble Software Bundle for PC Lovers', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-02-14', price: null, games: [
    '3DMark Advanced', 'PCMark 8', 'VRMark'] },
  { name: 'Humble Civilization Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-02-21', price: null, games: [
    "Sid Meier's Civilization IV: The Complete Edition", "Sid Meier's Civilization III: Complete",
    "Sid Meier's Civilization V - All DLC", "Sid Meier's Civilization V", "Sid Meier's Civilization V: Brave New World",
    "Sid Meier's Civilization V: Gods and Kings", 'Exoplanets Map Pack', "Sid Meier's Civilization: Beyond Earth",
    "Sid Meier's Civilization: Beyond Earth - Rising Tide"] },
  { name: 'Humble ARMA Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2017-02-28', price: null, games: [
    'Arma Tactics', 'Arma: Cold War Assault', 'Arma: Gold Edition', 'Arma 2', 'Arma 2: Army of the Czech Republic DLC',
    'Arma 2: British Armed Forces', 'Arma 2: Operation Arrowhead', 'Arma 2: Private Military Company', 'Arma 3',
    'Arma 3 Karts'] },
  { name: 'Humble Jumbo Bundle 8', store: 'Humble Bundle', kind: 'bundle', date: '2017-03-07', price: null, games: [
    'Legends of Eisenwald', 'The Journey Down 1+2 Bundle', 'Valhalla Hills', 'Aurion: Legacy of the Kori-Odan',
    'Jotun: Valhalla Edition', 'The Interactive Adventures of Dog Mendonça and Pizzaboy', 'Turmoil', 'Void Destroyer',
    'Warhammer: End Times - Vermintide', 'Verdun'] },
  { name: 'Humble Software Bundle: Streaming!', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-03-22', price: null, games: [
    'Choice Chamber', 'FaceRig', 'Quiplash', 'Drawful 2', 'FaceRig Pro Upgrade'] },
  { name: 'Humble Hooked On Multiplayer Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-03-28', price: null, games: [
    'Eon Altar', 'Primal Carnage: Extinction', 'Tricky Towers', 'Move or Die', 'Rampage Knights',
    'Ultimate Chicken Horse', 'HELLDIVERS', 'HELLDIVERS - Ranger Pack'] },
  { name: 'Amnesia Fortnight 2017', store: 'Humble Bundle', kind: 'bundle', date: '2017-04-04', price: null, games: [
    "Darwin's Dinner Prototype", "I Have No Idea What I'm Doing Prototype", 'Kiln Prototype',
    'The Gods Must Be Hungry Prototype', 'Amnesia Fortnight 2017 - The Series', 'Costume Quest', "Hack 'n' Slash",
    'Iron Brigade', 'Little Pink Best Buds Prototype', 'Spacebase DF-9', 'Stacking'] },
  { name: 'Humble Intergalactic Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-04-11', price: null, games: [
    'Galactic Civilizations II: Ultimate Edition', 'Sins of a Solar Empire: Trinity', 'Space Hulk Ascension',
    'Planetary Annihilation: TITANS', 'Rebel Galaxy', 'Galactic Civilizations III', 'Offworld Trading Company'] },
  { name: 'Humble Wild Frontier Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-04-18', price: null, games: [
    'FRONTIERS', 'Gods Will Be Watching', 'Ice Lakes', 'Hard West', 'Renowned Explorers: International Society',
    'Spintires', 'Slime Rancher'] },
  { name: 'Humble Very Positive Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-05-02', price: null, games: [
    'Super Mega Baseball: Extra Innings', 'The Deadly Tower of Monsters', 'They Bleed Pixels', 'Crashlands', 'Hacknet',
    'Underrail', 'Curious Expedition', "Stephen's Sausage Roll"] },
  { name: 'Humble tinyBuild Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2017-05-09', price: null, games: [
    'Divide by Sheep', 'No Time To Explain Remastered', 'Road to Ballhalla', 'SpeedRunners', 'Clustertruck',
    'Guts and Glory', 'Party Hard', 'Punch Club Deluxe', 'The Final Station', 'Streets of Rogue',
    'The Only Traitor DLC', 'Hello Neighbor'] },
  { name: 'Humble Indie Bundle 18', store: 'Humble Bundle', kind: 'bundle', date: '2017-05-16', price: null, games: [
    'SteamWorld Heist', 'Windward', 'Ziggurat', 'A Story About My Uncle', 'Beholder', 'Goat Simulator: GOATY',
    'Kentucky Route Zero', 'Neon Drive', 'Owlboy'] },
  { name: 'Humble GameOn Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2017-05-23', price: null, games: [
    '80 Days', 'Her Story', 'Worms Clan Wars', "Broken Sword 5 - the Serpent's Curse", 'Grim Fandango Remastered',
    'The Stanley Parable', 'Borderlands: The Pre-Sequel', 'Day of the Tentacle Remastered'] },
  { name: 'Humble Adult Swim Games Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-05-30', price: null, games: [
    'Small Radios Big Televisions', 'Volgarr the Viking', 'WASTED', 'Westerado: Double Barreled', 'Duck Game',
    'Headlander', 'Rise & Shine', 'Glittermitten Grove', 'Rain World'] },
  { name: 'Humble Sekai Project Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-06-06', price: null, games: [
    'Ame no Marginal -Rain Marginal-', 'fault - milestone one', 'KARAKARA', 'NEKOPARA Vol. 0',
    'fault - milestone two side: above', 'Highway Blossoms', 'Idol Magical Girl Chiru Chiru Michiru Part 1',
    'Japanese School Life', 'Narcissu 10th Anniversary Anthology Project',
    'Narcissu 10th Anniversary Anthology Project - Season Pass', 'NEKOPARA Vol. 1',
    'Sound of Drop - fall into poison -', 'Idol Magical Girl Chiru Chiru Michiru Part 2', "Memory's Dogma CODE:01",
    'NEKOPARA Vol. 2', 'Root Double -Before Crime * After Days- Xtend Edition'] },
  { name: 'Humble Oceans Day Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2017-06-08', price: null, games: [
    'ABZÛ', 'Aquaria', 'Brothers - A Tale of Two Sons', 'Columns', 'Columns III', 'Guns of Icarus Online',
    'NEO AQUARIUM - The King of Crustaceans -', 'Riptide GP: Renegade', 'Submerged', 'UnderWater Adventure',
    'World of Diving'] },
  { name: 'E3 2017 Digital Ticket', store: 'Humble Bundle', kind: 'bundle', date: '2017-06-11', price: null, games: [
    'Battle Islands: Commanders - Exclusive E3 Crate', 'Gemini: Heroes Reborn', 'Gems of War - Demon Hunter Bundle',
    'Gotham City Impostors Free to Play: Professional Impostor Kit', 'HAWKEN - Prosk Starter Bundle',
    'Rock of Ages 2 - Classic Pack', 'SpellForce 3 Temporary Beta Test', 'Tyranny - Portrait Pack',
    'First Assault - First Connection Crate', "Riders of Icarus - Heroic Ranger's Fury Package",
    'XCOM: Enemy Unknown Complete Pack'] },
  { name: 'Humble Capcom Rising Bundle 2017', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-07-11', price: null, games: [
    'DmC Devil May Cry', 'Strider', 'Umbrella Corps', 'Dead Rising 2: Off the Record', 'Resident Evil',
    'Resident Evil 0', 'Resident Evil 6', 'Umbrella Corps DLC: Upgrade Pack', 'Dead Rising 2', 'Dead Rising 3'] },
  { name: 'Humble Telltale Bundle 2017', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-07-18', price: null, games: [
    'Bone Complete Bundle', 'Hector: Badge of Carnage Full Series', 'Poker Night at the Inventory (2010)',
    'Puzzle Agent', 'Puzzle Agent 2', 'Sam & Max: Season 1', 'Sam & Max: Season 2', "Telltale Texas Hold'Em",
    'The Walking Dead', 'Game of Thrones - A Telltale Games Series', 'Jurassic Park: The Game', 'Poker Night 2',
    "Sam & Max: The Devil's Playhouse", 'Tales from the Borderlands', 'The Walking Dead: 400 Days',
    'The Walking Dead: Michonne'] },
  { name: 'Humble Saints Row Bundle 2017', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-07-25', price: null, games: [
    'Deadlight Director’s Cut', 'Homefront', 'Risen 3 - Complete Edition', 'Saints Row 2', 'Killer is Dead',
    'Lost Horizon', 'Mighty No. 9', 'Sacred Franchise Pack', 'Saints Row: Gat out of Hell', 'Saints Row: The Third',
    'Secret Files: Tunguska', 'Homefront: The Revolution', 'Saints Row IV Game of the Century Edition',
    'Saints Row: Gat out of Hell - Devil’s Workshop pack', 'Saints Row: The Third - The Full Package',
    'Agents of Mayhem'] },
  { name: 'Humble Gamemaker Re-Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-08-01', price: null, games: [
    'Cook, Serve, Delicious!', 'GameMaker: Studio Professional package', 'INK', 'Uncanny Valley',
    'Galactic Missile Defense', 'GameMaker: Studio HTML5', 'Home', 'Solstice', 'GameMaker: Studio Android',
    'GameMaker: Studio iOS'] },
  { name: 'Megadimension Neptunia VII Digital Complete Set (Aug 2017)', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-08-04', price: null, games: [
    'Megadimension Neptunia VII', 'Megadimension Neptunia VII Deluxe Set', 'Megadimension Neptunia VII Equipment Pack',
    'Megadimension Neptunia VII Nightwear Pack', 'Megadimension Neptunia VII Party Character [God Eater]',
    'Megadimension Neptunia VII Party Character [Million Arthur]',
    'Megadimension Neptunia VII Party Character [Nepgya]', 'Megadimension Neptunia VII Party Character [Nitroplus]',
    'Megadimension Neptunia VII Party Character [Umio]', 'Megadimension Neptunia VII Processor Pack',
    'Megadimension Neptunia VII Swimsuit Pack', 'Megadimension Neptunia VII Trial Weapon Pack',
    'Megadimension Neptunia VII Ultimate Weapon Pack', 'Megadimension Neptunia VII Weapon Pack'] },
  { name: 'Humble microJUMBO Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2017-08-08', price: null, games: [
    'Geometry Dash', 'Oh...Sir! The Insult Simulator', 'Pony Island', 'Space Pilgrim Episode I: Alpha Centauri',
    'Space Pilgrim Episode II: Epsilon Indi', 'Space Pilgrim Episode III: Delta Pavonis',
    'Space Pilgrim Episode IV: Sol', 'Devil Daggers', 'hack_me', 'hack_me 2', 'Oh...Sir! The Hollywood Roast',
    'Town of Salem', "Who's Your Daddy?!"] },
  { name: 'Humble Spooky Horror Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-08-22', price: null, games: [
    'Dead Age', 'DreadOut', 'DreadOut Soundtrack & Manga DLC', 'DreadOut: Keepers of The Dark',
    'Lakeview Cabin Collection', 'Alien: Isolation', "Five Nights at Freddy's: Sister Location",
    'Layers of Fear: Masterpiece Edition', 'Dead by Daylight'] },
  { name: 'Humble Jumbo Bundle 9', store: 'Humble Bundle', kind: 'bundle', date: '2017-08-29', price: null, games: [
    'Human Fall Flat', 'Infested Planet', "Infested Planet - Trickster's Arsenal", 'The Flame in the Flood',
    'Caveblazers', 'Marooners', 'Samorost 3', 'Verdun', 'Warhammer: End Times - Vermintide',
    'Warhammer: End Times - Vermintide Drachenfels', 'Warhammer: End Times Vermintide: Seal of the Three Headed Snake',
    'American Truck Simulator'] },
  { name: 'Humble Hunie Sakura Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-09-05', price: null, games: [
    'HunieCam Studio', 'Sakura Agent', 'Sakura Angels', 'Sakura Beach', 'Sakura Beach 2', 'Sakura Fantasy Chapter 1',
    'Sakura Spirit', 'HuniePop', 'Sakura Magical Girls', 'Sakura Nova', 'Sakura Santa', 'Sakura Shrine Girls',
    'Sakura Space', 'Sakura Swim Club', 'Sakura Dungeon'] },
  { name: 'Humble Capcom X Sega X Atlus Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-09-12', price: null, games: [
    'Bionic Commando', 'Citizens of Earth', 'Rollers of the Realm', 'Sonic Adventure™ 2', 'Zeno Clash 2', 'Dead Rising',
    'Renegade Ops Collection', 'Resident Evil 4 (2005)', 'Sonic Generations', 'Tesla Effect',
    'Devil May Cry 4 Special Edition', 'Motorsport Manager'] },
  { name: 'Humble Very Positive Bundle 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-09-19', price: null, games: [
    'Dungeon Souls', 'Neon Chrome', 'RIVE', 'Middle-earth: Shadow of Mordor Game of the Year Edition', 'Oxenfree',
    'Ultimate Chicken Horse', 'Beat Cop', 'Death Road to Canada', 'Middle-earth™: Shadow of War™'] },
  { name: 'Humble Gems Bundle 2', store: 'Humble Bundle', kind: 'bundle', date: '2017-09-29', price: null, games: [
    'Hustle Cat', 'Tattletail', 'The Count Lucanor', 'Apotheon', 'Pinstripe', 'Slayaway Camp', 'CRYPTARK',
    'Has-Been Heroes'] },
  { name: 'Humble Stardock Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2017-10-03', price: null, games: [
    'Fallen Enchantress', 'Sorcerer King: Rivals', 'The Corporate Machine', 'The Political Machine 2016',
    'Fallen Enchantress Ultimate Edition', 'Galactic Civilizations III', 'Sins of a Solar Empire: Rebellion',
    'Ashes of the Singularity: Escalation', 'Ashes of the Singularity: Escalation - Gauntlet DLC',
    'Ashes of the Singularity: Escalation - Overlord Scenario Pack DLC',
    'Ashes of the Singularity: Escalation - Turtle Wars DLC', 'Galactic Civilizations III: Crusade Expansion Pack',
    'Offworld Trading Company'] },
  { name: 'Humble RPG Maker Software Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-10-04', price: null, games: [
    'Pale Echoes', 'Remnants of Isolation', 'RPG Maker VX Ace', 'RPG Maker VX Ace - Action & Battle Themes',
    'RPG Maker VX Ace - Evil Castle Tiles Pack', 'RPG Maker VX Ace - High Fantasy Resource Bundle',
    'RPG Maker VX Ace - High Fantasy Resource Bundle II', 'RPG Maker VX Ace - High Fantasy: The Deep',
    'RPG Maker VX Ace - Magnificent Quest Music Pack', "RPG Maker VX Ace - The Adventurer's Final Journey",
    'RPG Maker VX Ace - Time Fantasy: Monsters', 'RPG Maker VX Ace - Tyler Warren RTP Redesign 1', 'Antagonist',
    'Deadly Sin', 'Deadly Sin 2', 'RPG Maker VX'] },
  { name: 'Humble Endless RPG Lands Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-10-10', price: null, games: [
    'Borderlands: Game of the Year', 'The Incredible Adventures of Van Helsing: Final Cut', 'Wurm Unlimited',
    'Borderlands 2', 'Borderlands 2: Mechromancer Pack', 'Borderlands 2: Psycho Pack',
    'Borderlands 2: Ultimate Vault Hunter Upgrade Pack', 'Borderlands 2: Ultimate Vault Hunter Upgrade Pack 2',
    'ENDLESS™ Legend', 'Guild of Dungeoneering Ultimate Edition', 'Borderlands: The Pre-Sequel'] },
  { name: 'Humble Software Bundle 2', store: 'Humble Bundle', kind: 'bundle', date: '2017-10-11', price: null, games: [
    'Rock Expansion', 'Rytmik Ultimate', 'Upgrade to Rytmik Ultimate'] },
  { name: 'Humble Down Under Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2017-10-17', price: null, games: [
    'Hand of Fate', 'Satellite Reign', 'Screencheat', 'The Warlock of Firetop Mountain', 'Crawl', 'Hacknet',
    'Hacknet - Labyrinths', 'Hurtworld', 'Armello'] },
  { name: 'Humble Day of the Devs 2017 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-10-24', price: null, games: [
    'Grim Fandango Remastered', 'Loot Rascals', 'Loot Rascals Soundtrack', 'TumbleSeed', 'ABZÛ',
    'Day of the Tentacle Remastered', 'Flinthook', 'Everything', 'Full Throttle Remastered'] },
  { name: 'Humble Extra Life Bundle 2017', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-10-30', price: null, games: [
    'Majesty 2', 'Majesty: Gold Edition', 'PAC-MAN CHAMPIONSHIP EDITION 2',
    'Guacamelee! Super Turbo Championship Edition', 'Kingsway', 'Leviathan: Warships', 'Rain World'] },
  { name: 'Humble Jumbo Bundle 10', store: 'Humble Bundle', kind: 'bundle', date: '2017-10-31', price: null, games: [
    'Epistory - Typing Chronicles', 'Grey Goo Definitive Edition', "Oddworld: New 'n' Tasty", 'How to Survive 2',
    'Kingdom: New Lands + Kingdom: Classic', 'PROTOTYPE 2', "The Bard's Tale", 'Tormentor❌Punisher',
    'Wasteland 1 - The Original Classic', 'Wasteland 2'] },
  { name: 'Humble Strategy Simulator Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-11-07', price: null, games: [
    'Out of the Park Baseball 18', 'Rebuild 3: Gangs of Deadsville', 'SimplePlanes', 'Mad Games Tycoon',
    'Plague Inc: Evolved', 'Platform Clutter Scenery Pack', 'Town Scenery Pack', 'Train Simulator 2017 Humble Bundle',
    'Cities: Skylines Deluxe Edition (62701)'] },
  { name: 'Humble Care Package Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-11-14', price: null, games: [
    'Arma: Gold Edition', 'Darkest Dungeon', 'DreadOut', 'Duck Game', 'Fearless Fantasy', 'Grey Goo Definitive Edition',
    'Her Story', 'Jump Stars', 'KHOLAT', 'Lakeview Cabin Collection', "Machinarium Collector's Edition", 'Magicka',
    'Mighty No. 9', 'Minecraft: Story Mode - A Telltale Games Series', 'Move or Die',
    'No Time To Explain Remastered'] },
  { name: 'Humble Codemasters Racing Bundle 2017', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-11-28', price: null, games: [
    'F1 2011', 'F1 2012', 'F1 Race Stars', 'Toybox Turbos', 'F1 2014', 'F1 2015', 'F1 Race Stars Retail with DLC',
    'F1 2017 ‘1988 McLAREN MP4/4 CLASSIC CAR DLC’', 'GRID 2', 'GRID Autosport', 'Hyundai R5 rally car',
    'Team Booster Pack', 'DiRT Rally', 'F1 2016'] },
  { name: 'Humble MangaGamer and Friends Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2017-12-13', price: null, games: [
    'A Kiss For The Petals - Remembering How We Met', 'eden*', 'Higurashi When They Cry Hou - Ch.1 Onikakushi',
    'Higurashi When They Cry Hou - Ch.2 Watanagashi', 'Go Go Nippon 2015 Deluxe Edition', 'Go! Go! Nippon! 2016',
    'Higurashi When They Cry Hou - Ch.3 Tatarigoroshi', 'Higurashi When They Cry Hou - Ch.4 Himatsubushi',
    'If My Heart Had Wings', 'LoveKami -Divinity Stage-', 'Higurashi When They Cry Hou - Ch.5 Meakashi',
    'LoveKami -Useless Goddess-', 'Princess Evangile'] },
  { name: 'Humble Staff Picks Bundle: Scribble!', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-01-02', price: null, games: [
    'LiEat', 'Punch Club Deluxe', 'Tempest', 'Aragami', 'Beholder', 'BioShock Infinite', 'SHENZHEN I/O'] },
  { name: 'Humble Hope for Orphans Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-01-09', price: null, games: [
    'BLACKHOLE', 'IL-2 Sturmovik: 1946', 'Killing Floor', 'Red Orchestra 2 Multiplayer with Rising Storm',
    'Homefront: The Revolution', 'Killing Floor 2', "King's Bounty: Platinum", 'Call to Arms - Basic Edition package',
    'Call to Arms - Deluxe Edition upgrade', 'Rising Storm 2: Vietnam'] },
  { name: 'Humble Paradox Bundle 2018', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-01-23', price: null, games: [
    'Cities in Motion 2', 'Magicka 2', 'Majesty 2 Collection', 'Crusader Kings II', 'Crusader Kings II: The Old Gods',
    'Europa Universalis III Collection (sub/29112)', 'Hearts of Iron Collection III (Jan 2014) (sub/37223)',
    'Pillars of Eternity', 'Stellaris'] },
  { name: 'Rockstar Games Humble Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-01-30', price: null, games: [
    'Grand Theft Auto III', 'Grand Theft Auto: Vice City', 'Manhunt', 'Max Payne', 'Bully: Scholarship Edition',
    'Grand Theft Auto: San Andreas', 'L.A. Noire', 'Max Payne 2: The Fall of Max Payne',
    'Grand Theft Auto IV: The Complete Edition', 'L.A. Noire: DLC Bundle', 'Max Payne 3', 'Max Payne 3 Season Pass'] },
  { name: "Humble Bundle's Best of 2017", store: 'Humble Bundle', kind: 'bundle',
    date: '2018-02-06', price: null, games: [
    "Five Nights at Freddy's: Sister Location", 'Goat Simulator', 'Hacknet', 'Death Road to Canada',
    'Sins of a Solar Empire: Rebellion', 'Turmoil', 'Verdun', 'Dead by Daylight'] },
  { name: 'Humble Hunie Sekai Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-02-13', price: null, games: [
    'fault - milestone one', 'fault - milestone two side: above', 'KARAKARA',
    'Machina of the Planet Tree -Planet Ruler-', 'RaidersSphere4th', 'Sunrider Academy', 'A Magical High School Girl',
    'Highway Blossoms', 'HunieCam Studio', 'HuniePop', 'Just Deserts',
    'Root Double -Before Crime * After Days- Xtend Edition', "Sunrider: Liberation Day - Captain's Edition",
    'KARAKARA2', 'NEKO-NIN exHeart', 'NEKO-NIN exHeart +PLUS Nachi'] },
  { name: 'Humble Classics Return Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-02-20', price: null, games: [
    "Broken Sword 5 - the Serpent's Curse", 'Shadowrun Returns', "Shadowrun: Dragonfall - Director's Cut",
    'Tesla Effect', 'Age of Wonders III', 'Shadowrun: Hong Kong - Extended Edition', 'Wasteland 2', 'Xenonauts',
    'Dreamfall Chapters', 'Torment: Tides of Numenera'] },
  { name: 'Humble Brawler Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-02-27', price: null, games: [
    'BlazBlue: Continuum Shift Extend', 'GUILTY GEAR XX ACCENT CORE PLUS R', 'Skullgirls 2nd Encore',
    'Arcana Heart 3 LOVE MAX!!!!!', 'Street Fighter X Tekken Retail', 'GUILTY GEAR Xrd -SIGN-', 'Rivals of Aether'] },
  { name: 'Humble Bob Ross Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-03-13', price: null, games: [
    'Crayon Physics Deluxe', 'Draw a Stickman: EPIC', "Draw a Stickman: EPIC - Friend's Journey",
    'Draw a Stickman: EPIC 2', 'Draw a Stickman: EPIC 2 - Drawn Below', 'Draw Your Game', 'Drawful 2',
    'Passpartout: The Starving Artist'] },
  { name: 'Humble Jumbo Bundle 11', store: 'Humble Bundle', kind: 'bundle', date: '2018-03-20', price: null, games: [
    'Domina', 'Kingdom: New Lands + Kingdom: Classic', 'Rusty Lake: Roots', "Flat Kingdom Paper's Cut Edition",
    'Kathy Rain', 'N++', 'Orwell', 'Tropico 5', 'Tropico 5 - Espionage', 'Tropico 5 - Waterborne', 'Obduction'] },
  { name: 'Humble Indie Bundle 19', store: 'Humble Bundle', kind: 'bundle', date: '2018-03-27', price: null, games: [
    'Halcyon 6: Lightspeed Edition', 'Mini Metro', 'Rakuen', 'Action Henk', 'JYDGE', 'Keep Talking and Nobody Explodes',
    'Poly Bridge', 'SOMA', 'SUPERHOT (Pre MCD Launch)'] },
  { name: 'Humble Strategy Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-04-10', price: null, games: [
    'Company of Heroes 2 - Whale and Dolphin Conservation Charity Pattern Pack',
    'Dungeon of the Endless (with Artbook depot)', 'Endless Space - Collection', 'Planetary Annihilation: TITANS',
    'ENDLESS™ Legend', 'ENDLESS™ Legend - Tempest Expansion Pack', 'Total War: Empire - Definitive Edition',
    'ENDLESS™ Space 2', 'Tooth and Tail'] },
  { name: 'Humble CRYENGINE Bundle 2018', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-05-01', price: null, games: [
    'Aporia: Beyond The Valley', 'Rolling Sun', 'The Land of Pain', 'Miscreated', 'Ryse: Son of Rome',
    'Sniper Ghost Warrior 2', 'SNOW - Pro Pack', 'UAYEB: The Dry Land - Episode 1', 'Homefront: The Revolution',
    'Sniper Ghost Warrior 3'] },
  { name: 'Humble War Gamez Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-05-08', price: null, games: [
    'Insurgency', 'Mercenary Kings', 'Panzer Corps', 'Panzer Corps: Allied Corps', '8-Bit Armies',
    'Day of Infamy Deluxe Edition', 'Gloria Victis', 'Rising Storm 2: Vietnam - Digital Deluxe Edition'] },
  { name: 'Humble Hooked On Multiplayer 2018 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-05-15', price: null, games: [
    'Rampage Knights', 'Stick Fight: The Game', 'Tumblestone Full Game', 'Besiege', 'Duck Game', 'Hover',
    'Rocket League'] },
  { name: 'Humble ARMA 2018 Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-05-29', price: null, games: [
    'Arma Tactics', 'Arma: Cold War Assault', 'Arma: Gold Edition', 'Arma 3', 'Arma 3 Helicopters', 'Arma 3 Karts',
    'Arma 3 Marksmen', 'Arma 2', 'Arma 2: Army of the Czech Republic DLC', 'Arma 2: British Armed Forces',
    'Arma 2: Operation Arrowhead', 'Arma 2: Private Military Company', 'Arma 3 Apex'] },
  { name: 'Humble Daedalic Bundle 2018', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-06-05', price: null, games: [
    "Anna's Quest", 'Caravan', 'Deponia: The Complete Journey', 'Memoria', 'Memoria Soundtrack', 'Deponia Doomsday',
    'Deponia Doomsday Soundtrack', 'Silence', 'Witch It', 'Bounty Train', 'Shadow Tactics: Blades of the Shogun',
    'The Long Journey Home'] },
  { name: 'Humble CI Games Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-07-17', price: null, games: [
    'Chronicles of Mystery: The Scorpio Ritual', 'Combat Wings: Battle of Britain',
    'Sniper Ghost Warrior Gold base + 2 DLC', 'Lords of the Fallen - Game of the Year Edition',
    'Sniper Ghost Warrior 2: World Hunter Pack', "Sniper: Ghost Warrior 2 Collector's Edition",
    'Sniper Ghost Warrior 3', 'Sniper Ghost Warrior 3 - Multiplayer Map Pack'] },
  { name: 'Humble Up Your Game Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-07-18', price: null, games: [
    'VoiceBot', 'DisplayFusion'] },
  { name: 'Humble Sports Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-07-31', price: null, games: [
    'GRID 2', 'SEGA Bass Fishing + Eastside Hockey Manager', 'DiRT Rally', 'Motorsport Manager', 'Super Blood Hockey',
    'F1 2017'] },
  { name: 'Humble Jackbox Party Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-08-14', price: null, games: [
    'Fibbage XL', 'Quiplash', "YOU DON'T KNOW JACK Vol. 1 XL", "YOU DON'T KNOW JACK Vol. 2", 'The Jackbox Party Pack',
    'The Jackbox Party Pack 2', "YOU DON'T KNOW JACK Vol. 3", "YOU DON'T KNOW JACK Vol. 4 The Ride", 'Drawful 2',
    'The Jackbox Party Pack 3'] },
  { name: 'Nepify Your Life Bundle (Aug 2018)', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-08-20', price: null, games: [
    'Cyberdimension Neptunia: 4 Goddesses Online', 'Hyperdevotion Noire: Goddess Black Heart',
    'Hyperdimension Neptunia Re;Birth1', 'Hyperdimension Neptunia Re;Birth2 Sisters Generation',
    'Hyperdimension Neptunia Re;Birth3 V Generation', 'Hyperdimension Neptunia U: Action Unleashed',
    'Megadimension Neptunia VII', 'MegaTagmension Blanc + Neptune VS Zombies',
    'Superdimension Neptune VS Sega Hard Girls'] },
  { name: 'Humble Spooky Horror Bundle 2018', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-08-21', price: null, games: [
    'How to Survive', 'How to Survive 2', 'Layers of Fear (2016)', 'White Noise 2',
    'BioShock + BioShock Remastered (14603)', 'Detention', 'Yomawari: Night Alone', 'Dead by Daylight',
    'Friday the 13th: The Game'] },
  { name: 'Fairy Fencer F: Complete Edition', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-08-22', price: null, games: [
    'Fairy Fencer F', 'Fairy Fencer F: Additional Fairy Pack', 'Fairy Fencer F: Hot Springs Set',
    'Fairy Fencer F: Surpass Your Limits Set', 'Fairy Fencer F: Swimwear Set', 'Fairy Fencer F: Ultimate Armor Pack',
    'Fairy Fencer F: Weapon Change Accessory Set'] },
  { name: 'Megadimension Neptunia VII Digital Complete Set (Aug 2018)', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-08-22', price: null, games: [
    'Megadimension Neptunia VII', 'Megadimension Neptunia VII Deluxe Set', 'Megadimension Neptunia VII Equipment Pack',
    'Megadimension Neptunia VII Nightwear Pack', 'Megadimension Neptunia VII Party Character [God Eater]',
    'Megadimension Neptunia VII Party Character [Million Arthur]',
    'Megadimension Neptunia VII Party Character [Nepgya]', 'Megadimension Neptunia VII Party Character [Nitroplus]',
    'Megadimension Neptunia VII Party Character [Umio]', 'Megadimension Neptunia VII Processor Pack',
    'Megadimension Neptunia VII Swimsuit Pack', 'Megadimension Neptunia VII Trial Weapon Pack',
    'Megadimension Neptunia VII Ultimate Weapon Pack', 'Megadimension Neptunia VII Weapon Pack'] },
  { name: 'Humble Digital Tabletop Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-08-28', price: null, games: [
    'Mysterium', 'Sentinels of the Multiverse', 'Ticket to Ride + 10 Maps', 'Carcassonne: The Official Board Game',
    'Pathfinder Adventures', 'Sentinels of the Multiverse - Shattered Timelines', 'Talisman - The Dungeon Expansion',
    'Talisman - The Highland Expansion', 'Talisman: Digital Classic Edition', 'Armello'] },
  { name: 'Humble Unity Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-09-04', price: null, games: [
    'AER Memories of Old', 'Oxenfree', 'Last Day of June', 'The Final Station',
    "Wasteland 2: Director's Cut with Wasteland 1 + 6 DLCs", 'Shadow Tactics: Blades of the Shogun',
    'Torment: Tides of Numenera'] },
  { name: 'Nepify Your Life Bundle (Sep 2018)', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-09-06', price: null, games: [
    'Cyberdimension Neptunia: 4 Goddesses Online', 'Hyperdevotion Noire: Goddess Black Heart',
    'Hyperdimension Neptunia Re;Birth1', 'Hyperdimension Neptunia Re;Birth2 Sisters Generation',
    'Hyperdimension Neptunia Re;Birth3 V Generation', 'Hyperdimension Neptunia U: Action Unleashed',
    'Megadimension Neptunia VII', 'MegaTagmension Blanc + Neptune VS Zombies',
    'Superdimension Neptune VS Sega Hard Girls'] },
  { name: 'Humble One Special Day Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-09-18', price: null, games: [
    'Binary Domain', 'Crazy Taxi', 'OlliOlli2: Welcome to Olliwood', 'Streets of Rage', 'Alpha Protocol', 'GRID 2',
    'Operation Flashpoint: Red River', 'Surgeon Simulator', "Marvel's Guardians of the Galaxy: The Telltale Series",
    'Stronghold Crusader 2'] },
  { name: 'Humble Overwhelmingly Positive Bundle 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-10-02', price: null, games: [
    'SIMULACRA', 'Subsurface Circular', 'Wuppo - Definitive Edition', 'LISA', 'Momodora: Reverie Under the Moonlight',
    'Nuclear Throne', 'SOMA', 'Opus Magnum'] },
  { name: 'Humble RPG Book Bundle: Vampire The Masquerade', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-10-03', price: null, games: [
    'Judas Goat'] },
  { name: 'TinyBuild Build-Your-Own-Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-10-08', price: null, games: [
    'Boid', 'Clustertruck', 'Community Inc', 'Diaries of a Spaceport Janitor', 'Divide by Sheep',
    'Dungelot : Shattered Lands', 'Fearless Fantasy', 'GARAGE: Bad Trip', 'Guts and Glory', 'Lovely Planet',
    'Lovely Planet Arcade', 'Mr Shifty', 'No Time To Explain Remastered', 'Not The Robots', 'Outpost Zero',
    'Party Hard'] },
  { name: 'Humble Discovery Pack', store: 'Humble Bundle', kind: 'bundle', date: '2018-10-09', price: null, games: [
    'Kentucky Route Zero', 'Osiris: New Dawn', 'Phantom Brave PC', 'RWBY: Grimm Eclipse', 'Tricky Towers',
    'War for the Overworld + Heart of Gold'] },
  { name: 'Humble WB Games Classics Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-10-23', price: null, games: [
    'Batman: Arkham Origins', 'Middle-earth: Shadow of Mordor Game of the Year Edition', 'Scribblenauts Unlimited',
    'Bastion', 'Injustice: Gods Among Us Ultimate Edition', 'Mad Max', 'Batman: Arkham Knight',
    'Batman: Arkham Knight - Season Pass'] },
  { name: 'Humble Software Bundle: RPG Maker by Degica Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-10-26', price: null, games: [
    'Game Character Hub PE: DS Generator Parts', 'Game Character Hub PE: Second Story',
    'Game Character Hub: Portfolio Edition', 'Last Word', 'RPG Maker XP', 'Always Sometimes Monsters', 'RPG Maker VX',
    'Skyborn', 'Echoes of Aetheria', 'Pale Echoes', 'RPG Maker VX Ace',
    'RPG Maker VX Ace - Ancient Dungeons: Base Pack', 'RPG Maker VX Ace - Animations Collection I: Quintessence',
    'RPG Maker VX Ace - Fantastic Buildings: Medieval', 'RPG Maker VX Ace - Fantasy Hero Character Pack',
    'RPG Maker VX Ace - Futuristic Tiles Resource Pack'] },
  { name: 'Humble Day of the Devs 2018 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-10-27', price: null, games: [
    'Burly Men at Sea', 'Full Throttle Remastered', 'Hotline Miami 2: Wrong Number', 'RiME', 'Yooka-Laylee',
    'Hyper Light Drifter', 'Minit'] },
  { name: 'Humble Warhammer Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-11-06', price: null, games: [
    'Talisman - The Blood Moon Expansion', 'Talisman - The Harbinger Expansion', 'Talisman - The Sacred Pool Expansion',
    'Talisman: Digital Classic Edition', 'Warhammer 40,000: Dawn of War - Anniversary Edition', 'Blood Bowl 2',
    'Warhammer 40,000: Space Marine Collection', 'Warhammer: End Times - Vermintide', 'Battlefleet Gothic: Armada',
    'Warhammer 40,000: Dawn of War III', 'Warhammer: End Times - Vermintide Stromdorf'] },
  { name: 'Humble Dystopian Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-11-13', price: null, games: [
    'Beholder', 'Distrust', 'Orwell', 'Tokyo 42', '60 Seconds!', 'Orwell: Ignorance is Strength', 'Rain World',
    'Observer'] },
  { name: 'Humble Jumbo Bundle 12', store: 'Humble Bundle', kind: 'bundle', date: '2018-11-20', price: null, games: [
    'Pinstripe', 'Rise & Shine', 'Super House of Dead Ninjas', 'Super House of Dead Ninjas: True Ninja Pack',
    'Battle Chef Brigade', 'Construction-Simulator 2015', 'Project Highrise', 'DiRT 4', 'Oriental Empires'] },
  { name: 'Humble Board Games Bundle by Asmodee Digital', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-11-27', price: null, games: [
    'Abalone', 'Agricola: All Creatures Big and Small', 'Colt Express', 'Harald', 'Le Havre: The Inland Port',
    'Deathtrap Dungeon Trilogy', 'Fighting Fantasy Legends', 'King and Assassins', 'Pandemic: The Board Game',
    'Pathfinder Adventures', 'Small World', 'Splendor', 'Twilight Struggle'] },
  { name: 'Humble Software Bundle: Best of Stardock', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-11-28', price: null, games: [
    'Start10', 'Fences 3', 'Multiplicity'] },
  { name: 'Yogscast Jingle Jam 2018', store: 'Humble Bundle', kind: 'bundle', date: '2018-12-01', price: null, games: [
    "Alan Wake's American Nightmare", 'Animal Super Squad', 'Anomaly 2', 'Anomaly Defenders', 'Anomaly Korea',
    'Anomaly Warzone Earth', 'Anomaly Warzone Earth Mobile Campaign', 'BATALJ Beta', 'Blacksmith', 'Blade & Bones',
    'Board Battlefield', 'Chivalry: Medieval Warfare', 'Clatter', 'Clicker bAdventure'] },
  { name: 'Plug In Digital Build-Your-Own-Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2018-12-03', price: null, games: [
    'A Blind Legend', 'A Normal Lost Phone', 'Antisquad', 'Army General', 'Ascent Spirit',
    'Aurion: Legacy of the Kori-Odan', 'BAFL - Brakes Are For Losers', 'Boiling Bolt', 'Citadale - The Legends Trilogy',
    'Colonial Conquest', 'Crazy Pixel Streaker', 'Crewsaders', 'Cubikolor', 'Dead In Bermuda', 'Ethan: Meteor Hunter',
    'Frog Climbers'] },
  { name: 'Humble Team17 Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-12-04', price: null, games: [
    'Interplanetary: Enhanced Edition', 'Penarium', 'Worms Clan Wars', 'Overcooked', 'Overcooked - The Lost Morsel',
    'Sheltered', 'The Escapists', 'The Escapists - Alcatraz', 'The Escapists - Duct Tapes are Forever',
    'The Escapists - Escape Team', 'The Escapists - Fhurst Peak Correctional Facility', 'Worms W.M.D'] },
  { name: 'Humble Sonic Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2018-12-18', price: null, games: [
    'Sonic Adventure DX', 'Sonic Adventure 2: Battle Mode DLC', 'Sonic Adventure™ 2', 'Sonic and SEGA All Stars Racing',
    'Sonic CD', 'SONIC THE HEDGEHOG 4 Episode I', 'Sonic & All-Stars Racing Transformed Collection',
    'Sonic Generations', 'Sonic Lost World', 'SONIC THE HEDGEHOG 4 Episode II', 'Sonic Forces', 'Sonic Mania'] },
  { name: 'Humble Stardock Bundle 2019', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-01-01', price: null, games: [
    'Galactic Civilizations I: Ultimate Edition', 'Galactic Civilizations II: Ultimate Edition',
    'Sins of a Solar Empire: Rebellion', 'Ashes of the Singularity: Escalation', 'Galactic Civilizations III',
    'Ashes of the Singularity: Escalation - Epic Map Pack DLC',
    'Ashes of the Singularity: Escalation - Turtle Wars DLC', 'Galactic Civilizations III: Intrigue Expansion',
    'Offworld Trading Company - Blue Chip Ventures DLC', 'Offworld Trading Company - Conspicuous Consumption DLC',
    'Offworld Trading Company - Limited Supply DLC', 'Offworld Trading Company - Scenario Toolkit DLC',
    'Offworld Trading Company - The Ceres Initiative DLC', 'Offworld Trading Company - The Patron and the Patriot DLC',
    'Offworld Trading Company Deluxe Edition', "Offworld Trading Company: Jupiter's Forge Expansion Pack"] },
  { name: 'Humble Double Fine Presents Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-01-15', price: null, games: [
    '140', 'Mountain', 'THOTH', 'Escape Goat 2', 'GNOG', 'Everything', 'Gang Beasts'] },
  { name: 'Humble Caffeine Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2019-01-22', price: null, games: [
    'GoNNER', 'Headlander', 'Treadnauts', 'Dear Esther: Landmark Edition', "Ken Follett's The Pillars of the Earth",
    'This War of Mine', 'Shadow Tactics: Blades of the Shogun', 'Tyranny'] },
  { name: 'Humble Paradox Bundle 2019', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-02-05', price: null, games: [
    "Age of Wonders 2: The Wizard's Throne", 'Crusader Kings II', 'Darkest Hour: A Hearts of Iron Game', 'Magicka 2',
    'Age of Wonders III', 'Crusader Kings II: The Old Gods', 'Europa Universalis IV',
    'Age of Wonders III - Deluxe Edition DLC', 'Europa Universalis IV: El Dorado',
    'Magicka 2 Upgrade to Deluxe Edition (sub/61815)', 'Steel Division: Normandy 44'] },
  { name: 'Humble Great GameMaker Games Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-02-12', price: null, games: [
    'BLACKHOLE', 'Cook, Serve, Delicious!', 'Cook, Serve, Delicious! 2!!', 'Kingsway', 'LOVE 2: kuso', 'Solstice',
    '12 is Better Than 6', 'Alone With You', 'Crashlands', "Don't Sink", 'Rivals of Aether', 'Soft Body',
    'Way of the Passive Fist'] },
  { name: 'Humble Neptunia Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2019-02-26', price: null, games: [
    'Amnesia: Memories', 'Hyperdimension Neptunia Re;Birth1', 'Hyperdimension Neptunia Re;Birth1 Deluxe Pack',
    'Hyperdimension Neptunia Re;Birth1 New Content 2 Colosseum + Characters',
    'Hyperdimension Neptunia Re;Birth2 Deluxe Pack', 'Hyperdimension Neptunia Re;Birth2 Sisters Generation',
    'Cyberdimension Neptunia: 4 Goddesses Online - Deluxe Pack', 'Hyperdimension Neptunia Re;Birth3 Deluxe Pack',
    'Hyperdimension Neptunia Re;Birth3 V Generation', 'Hyperdimension Neptunia U: Action Unleashed',
    'Megadimension Neptunia VII', 'Megadimension Neptunia VII Deluxe Set', 'Megadimension Neptunia VIIR',
    'Megadimension Neptunia VIIR - Deluxe Pack'] },
  { name: 'Humble Indie Bundle 20', store: 'Humble Bundle', kind: 'bundle', date: '2019-03-05', price: null, games: [
    'Among the Sleep', 'Tangledeep', 'Tangledeep - Soundtrack', 'The First Tree', 'Dream Daddy: A Dad Dating Simulator',
    'Getting Over It with Bennett Foddy', 'Tooth and Tail', 'Overgrowth'] },
  { name: 'THQ Nordic Build Your Own Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-03-11', price: null, games: [
    'Alone in the Dark (2008)', 'Alone in the Dark Anthology', 'Alone in the Dark: Illumination',
    'Alone in the Dark: The New Nightmare', 'AquaNox', 'AquaNox 2: Revelation', 'ArcaniA', 'ArcaniA: Fall of Setarrif',
    'Aura: Fate of the Ages', 'Battle Worlds: Kronos', 'Black Mirror I', 'Black Mirror II', 'Black Mirror III',
    'Bridge Project', 'Carmageddon: Max Damage', 'Chaser'] },
  { name: 'Humble Strategy Bundle 2019', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-03-12', price: null, games: [
    'Ashes of the Singularity: Escalation', 'Niche - a genetics survival game', 'Throne of Lies®: Medieval Politics',
    'Dungeons 3', "Offworld Trading Company Core Edition+Jupiter's Forge Expansion", 'Plague Inc: Evolved', 'Stellaris',
    "Sid Meier's Civilization VI"] },
  { name: 'Humble Curve Digital Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-03-19', price: null, games: [
    'Serial Cleaner', 'Stealth Inc 2', 'The Little Acre', 'Human Fall Flat', 'Smoke and Sacrifice', 'Stikbold!',
    'Bomber Crew', 'For The King'] },
  { name: 'Humble Hot Date Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2019-03-26', price: null, games: [
    'Creature Romances: Kokonoe Kokoro', 'Highway Blossoms', 'Just Deserts', 'Genital Jousting', 'Ladykiller in a Bind',
    'Purrfect Date', 'G-senjou no Maou - The Devil on G-String Voiced Edition', 'Sunrider Academy',
    "Sunrider: Liberation Day - Captain's Edition", 'Sunrider: Liberation Day - Theme Song', 'CLANNAD'] },
  { name: 'Whale Rock Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2019-03-29', price: null, games: [
    'DEPLOYMENT', 'Time Lock VR 1', 'We Are The Dwarves'] },
  { name: 'Humble BANDAI NAMCO Bundle 3', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-04-02', price: null, games: [
    'ENSLAVED: Odyssey to the West Premium Edition', 'Impact Winter', 'PAC-MAN Championship Edition DX+',
    '11-11 Memories Retold', 'GET EVEN', 'Little Nightmares', 'Project CARS', 'GOD EATER 2 Rage Burst',
    'Sword Art Online: Fatal Bullet', 'TEKKEN 7'] },
  { name: 'Humble Humongous Entertainment Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-04-09', price: null, games: [
    'Big Thinkers 1st Grade', 'Big Thinkers Kindergarten', "Fatty Bear's Birthday Surprise",
    "Let's Explore The Airport (Junior Field Trips)", "Let's Explore The Farm (Junior Field Trips)",
    "Let's Explore The Jungle (Junior Field Trips)", "Putt-Putt and Fatty Bear's Activity Pack",
    "Putt-Putt and Pep's Balloon-o-Rama", "Putt-Putt and Pep's Dog on a Stick", "Putt-Putt: Pep's Birthday Surprise",
    'SPY Fox in: Cheese Chase', 'Freddi Fish 2: The Case of the Haunted Schoolhouse',
    'Pajama Sam 4: Life Is Rough When You Lose Your Stuff!', 'Pajama Sam: Games to Play on Any Day',
    "Pajama Sam's Lost & Found", "Pajama Sam's Sock Works"] },
  { name: 'Humble Square Enix Collective Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-04-16', price: null, games: [
    'Deadbeat Heroes', 'Goetia', 'Octahedron: Transfixed Edition', 'Black The Fall',
    "Forgotton Anne Collector's Edition", 'The Turing Test', 'Children of Zodiarcs', 'Tokyo Dark'] },
  { name: 'Humble More Board Games Bundle by Asmodee Digital', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-04-23', price: null, games: [
    'Gloom', 'Love Letter', 'Ticket to Ride: First Journey', 'Twilight Struggle', 'Ascension',
    'Carcassonne: The Official Board Game', 'Inns & Cathedrals - Expansion', 'Mysterium', 'Mysterium - Hidden Signs',
    'Mysterium - Secrets and Lies', 'Pandemic: The Board Game', 'Pathfinder Adventures: Obsidian Edition',
    'Scythe: Digital Edition'] },
  { name: 'Humble LEGO Games Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2019-04-30', price: null, games: [
    'LEGO Batman: The Videogame', 'LEGO Harry Potter: Years 1-4', 'LEGO Batman 2: DC Super Heroes',
    'LEGO Harry Potter: Years 5-7', 'The LEGO Movie - Videogame', 'LEGO Batman 3: Beyond Gotham',
    'LEGO City Undercover', 'LEGO Worlds'] },
  { name: 'Humble tinyBuild Bundle with Graveyard Keeper', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-05-21', price: null, games: [
    'Diaries of a Spaceport Janitor', 'Punch Club Deluxe', 'SpeedRunners', 'The Final Station', 'Clustertruck',
    'Hello Neighbor', 'Party Hard', 'Party Hard: High Crimes DLC', 'Streets of Rogue', 'Graveyard Keeper',
    'Party Hard 2'] },
  { name: 'Humble Software Bundle: Streaming 2019', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-06-04', price: null, games: [
    'Getting Over It with Bennett Foddy', 'Aaero', 'FaceRig', 'Action! - Gameplay Recording and Streaming',
    'FaceRig Pro Upgrade'] },
  { name: 'Humble Very Positive Bundle 3', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-07-16', price: null, games: [
    'DISTRAINT 2', 'DISTRAINT 2 - OST', 'Rusty Lake Paradise', 'Unexplored', 'Bendy and the Ink Machine', 'Nex Machina',
    'Prison Architect', 'Shantae: Half-Genie Hero'] },
  { name: 'Humble Hooked on Multiplayer Bundle 2019', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-07-23', price: null, games: [
    'Death Squared', 'INVERSUS Deluxe', 'Think of the Children', 'Barony', 'Super Animal Royale',
    'Totally Accurate Battlegrounds', 'Deathgarden: BLOODHARVEST', 'Killing Floor 2 Digital Deluxe Edition'] },
  { name: 'Humble Crusader Kings II Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-07-30', price: null, games: [
    'Crusader Kings II', 'Crusader Kings II: Legacy of Rome', 'Crusader Kings II: Sunset Invasion',
    'Crusader Kings II: Sword of Islam', 'Crusader Kings II: The Old Gods', 'Crusader Kings II: The Republic',
    'Crusader Kings II: Charlemagne', 'Crusader Kings II: Horse Lords', 'Crusader Kings II: Rajas of India',
    'Crusader Kings II: Sons of Abraham', 'Crusader Kings II: Way of Life', 'Crusader Kings II: Conclave',
    'Crusader Kings II: Holy Fury', 'Crusader Kings II: Jade Dragon', 'Crusader Kings II: Monks and Mystics',
    "Crusader Kings II: The Reaper's Due"] },
  { name: 'Humble Bohemia Interactive Bundle 2019 with DayZ', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-08-06', price: null, games: [
    'Arma 2', 'Carrier Command: Gaea Mission', 'Take On Helicopters', 'Take On Mars', 'Arma 3', 'Original War',
    'Pound of Ground', 'Ylands with Exploration Pack', 'Arma 3 Apex', 'Arma X: Anniversary Edition', 'DayZ'] },
  { name: 'Humble Jackbox Party Bundle 2019', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-08-13', price: null, games: [
    "YOU DON'T KNOW JACK HEADRUSH", "YOU DON'T KNOW JACK MOVIES", "YOU DON'T KNOW JACK SPORTS",
    "YOU DON'T KNOW JACK TELEVISION", "YOU DON'T KNOW JACK Vol. 1 XL", "YOU DON'T KNOW JACK Vol. 6 The Lost Gold",
    'Drawful 2', 'Fibbage XL', 'Quiplash', "YOU DON'T KNOW JACK Vol. 2", "YOU DON'T KNOW JACK Vol. 3",
    "YOU DON'T KNOW JACK Vol. 4 The Ride", 'The Jackbox Party Pack', 'The Jackbox Party Pack 2',
    'The Jackbox Party Pack 3', 'The Jackbox Party Pack 4'] },
  { name: 'Humble Spooky Horror Bundle 2019', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-08-28', price: null, games: [
    'Agony', 'BUTCHER', 'The Town of Light', 'Beholder 2', 'Darkwood', 'Pacify', 'INSIDE'] },
  { name: 'Humble RPG Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2019-09-03', price: null, games: [
    'Deep Sky Derelicts', 'HIVESWAP: ACT 1', 'Immortal Planet', 'Cat Quest', 'Pillars of Eternity', 'Tyranny',
    'Borderlands GOTY Enhanced'] },
  { name: 'Humble Builder Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2019-09-17', price: null, games: [
    'Concrete Jungle', 'Tricky Towers', 'When Ski Lifts Go Wrong', 'Bridge Constructor Portal', 'Portal Knights',
    'SEUM: Speedrunners from Hell', 'Staxel'] },
  { name: 'Humble One Special Day Bundle 2019', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-10-01', price: null, games: [
    'Broken Age', 'Purrfect Date', 'Bomber Crew', 'Stronghold Crusader 2', "The Swords of Ditto: Mormo's Curse",
    'DiRT 4', 'Tannenberg'] },
  { name: 'Humble Software Bundle: RPG Maker Returns', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-10-08', price: null, games: [
    'Game Character Hub PE: DS Generator Parts', 'Game Character Hub PE: Second Story',
    'Game Character Hub: Portfolio Edition', 'RPG Maker 2000', 'RPG Maker VX', 'RPG Maker 2003', 'RPG Maker XP',
    'RPG Maker VX Ace', 'RPG Maker VX Ace - 8bit Fantasy RPG Tracks Vol.1', 'RPG Maker VX Ace - DS Resource Pack',
    'RPG Maker VX Ace - DS+ Resource Pack', 'RPG Maker VX Ace - Modern Music Mega-Pack',
    'RPG Maker VX Ace - Samurai Force 8bit Tracks Vol.1', 'RPG Maker VX Ace - Samurai Resource Pack', 'RPG Maker MV',
    'RPG Maker MV - Ancient Dungeons: Base Pack'] },
  { name: 'Humble Postmodern Bundle with Catherine Classic', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-10-15', price: null, games: [
    'Beckett', 'Rusty Lake Hotel', 'Thomas Was Alone', 'Yume Nikki', 'Everything', 'The Stanley Parable',
    'YUMENIKKI -DREAM DIARY-', 'Catherine Classic'] },
  { name: 'Humble Idea Factory Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-10-22', price: null, games: [
    'Moero Chronicle', 'Neptunia Shooter', 'Trillion', 'Fairy Fencer F', 'Fairy Fencer F: Additional Fairy Pack',
    'Fairy Fencer F: Hot Springs Set', 'Fairy Fencer F: Surpass Your Limits Set', 'Fairy Fencer F: Swimwear Set',
    'Fairy Fencer F: Ultimate Armor Pack', 'Fairy Fencer F: Weapon Change Accessory Set',
    'MegaTagmension Blanc + Neptune VS Zombies', 'MegaTagmension Blanc Deluxe Pack', 'Fairy Fencer F ADF Deluxe Pack',
    'Fairy Fencer F ADF Fairy Set 1: Ahab and Leela', 'Fairy Fencer F ADF Fairy Set 2: Aques and Drulger',
    'Fairy Fencer F ADF Fairy Set 3: Lars and Foxer'] },
  { name: 'Humble Day of the Devs Bundle 2019', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-10-29', price: null, games: [
    'ART SQOOL', 'Frog Detective 1: The Haunted Island', 'Battle Chef Brigade', 'Flipping Death', 'Minit',
    'ToeJam & Earl: Back in the Groove'] },
  { name: 'Humble Learn and Play VR-AR Game Dev Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-10-30', price: null, games: [
    'Insect Revolution VR', 'Keep Defending', 'Panzer Panic VR'] },
  { name: 'Humble Unreal Engine Game Development Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-11-12', price: null, games: [
    "Q.U.B.E: Director's Cut", 'Q.U.B.E. 2'] },
  { name: 'Humble Sonic Bundle 2019', store: 'Humble Bundle', kind: 'bundle', date: '2019-11-26', price: null, games: [
    'Sonic 3 & Knuckles', 'Sonic Adventure DX', 'Sonic Adventure 2: Battle Mode DLC', 'Sonic Adventure™ 2', 'Sonic CD',
    'SONIC THE HEDGEHOG 4 Episode I', 'Sonic and SEGA All Stars Racing', 'Sonic Generations', 'Sonic Lost World',
    'SONIC THE HEDGEHOG 4 Episode II', 'Sonic Forces', 'Sonic Mania', 'Sonic Mania - Encore DLC'] },
  { name: 'Yogscast Jingle Jam 2019', store: 'Humble Bundle', kind: 'bundle', date: '2019-12-01', price: null, games: [
    '1 Screen Platformer', "A Glider's Journey", 'Adventure Boy Cheapskate DX', 'Animal Super Squad', 'Anomaly 2',
    'Anomaly Defenders', 'Anomaly Korea', 'Anomaly Warzone Earth', 'Anomaly Warzone Earth Mobile Campaign',
    'Artemis: God-Queen of The Hunt', 'Balancelot', 'Bastion', 'Battlevoid: Harbinger', 'Border Force'] },
  { name: 'Humble Paradox Management Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2019-12-10', price: null, games: [
    'Cities in Motion', 'Cities in Motion 2', 'Prison Architect', 'Prison Architect - Aficionado',
    'Cities in Motion 2: European Cities', 'Cities In Motion: German Cities', 'Cities in Motion: Tokyo DLC',
    'Cities In Motion: US Cities', 'Cities: Skylines', 'Cities: Skylines - Content Creator Pack: European Suburbia',
    'Cities: Skylines - Green Cities', 'Cities: Skylines - Synthetic Dawn Radio', 'Cities: Skylines - Industries',
    'Surviving Mars: Digital Deluxe Edition', 'Surviving Mars: Green Planet', 'Surviving Mars: Project Laika'] },
  { name: 'January 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-01-03', price: null, games: [
    'Artifex Car Pack', 'Bad North: Jotunn Edition', 'DiRT Rally 2.0', 'DiRT Rally 2.0 - H2 RWD Double Pack',
    'DiRT Rally 2.0 - Opel Manta 400', 'DiRT Rally 2.0 - Porsche 911 RGT Rally Spec', 'Graveyard Keeper',
    'GRIP: Combat Racing', 'Mages of Mystralia', 'Middle-earth™: Shadow of War™', 'Street Fighter V',
    "Them's Fightin' Herds", 'Trailmakers', 'Two Point Hospital', 'Unrailed!', 'Whispers of a Machine'] },
  { name: 'Humble Sweet Farm Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2020-01-14', price: null, games: [
    'Evergarden', 'MagiCat', 'Niche - a genetics survival game', 'Equilinox', 'Samorost 3 Cosmic Edition',
    'Ultimate Chicken Horse', 'Stardew Valley'] },
  { name: 'Humble Australia Fire Relief Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-01-16', price: null, games: [
    'Armello', 'Assault Android Cactus', 'Crawl', 'Death Squared', 'Duck Game', 'Euro Truck Simulator 2',
    'Euro Truck Simulator 2 - Australian Paint Jobs Pack', 'Feather', 'FRAMED Collection',
    'Frog Detective 1: The Haunted Island', 'Hacknet', 'Hacknet - Labyrinths', 'Hand of Fate 2', 'Hollow Knight',
    'Machinarium', 'Masquerade: The Baubles of Doom'] },
  { name: 'Humble Europa Universalis IV Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-01-21', price: null, games: [
    'Europa Universalis IV', 'Europa Universalis IV Extreme Edition Retail',
    'Europa Universalis IV: American Dream DLC', 'Europa Universalis IV: Art of War',
    'Europa Universalis IV: Pre-Order Pack', 'Europa Universalis IV: Res Publica',
    'Europa Universalis IV: Wealth of Nations', 'Europa Universalis IV: Common Sense',
    'Europa Universalis IV: El Dorado', 'Europa Universalis IV: Mare Nostrum', 'Europa Universalis IV: Rights of Man',
    'Europa Universalis IV: The Cossacks', 'Europa Universalis IV: Cradle of Civilization',
    'Europa Universalis IV: Dharma', 'Europa Universalis IV: Golden Century',
    'Europa Universalis IV: Mandate of Heaven'] },
  { name: 'Humble Train Simulator Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-02-04', price: null, games: [
    'Riviera Line: Exeter to Kingswear', 'Train Simulator 2020 Store & Humble Bundle package',
    'Train Simulator: CSX AC6000CW Loco', 'Train Simulator: Miami - West Palm Beach',
    'Train Simulator: Western Hydraulics Pack Add-On', 'Train Simulator: BR Class 24 Loco Add-On',
    'Train Simulator: MRCE BR 185.5 Loco Add-On', 'Train Simulator: NJ TRANSIT GP40PH-2B Loco Add-On',
    'Train Simulator: North Jersey Coast Line Route Add-On',
    'Train Simulator: West Rhine: Cologne - Koblenz Route Add-On', 'Weardale and Teesdale Network Route Add-On',
    "Train Simulator: BR Class 402 '2-HAL' EMU Add-On",
    'Train Simulator: Chatham Main and Medway Valley Lines Route Add-On', 'Train Simulator: DB BR 114 Loco Add-On',
    'Train Simulator: Feather River Canyon Route Add-On', 'Train Simulator: Hamburg S1 S-Bahn Route Add-On'] },
  { name: 'Humble Software Bundle: PC Essentials', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-02-05', price: null, games: [
    '3DMark Advanced'] },
  { name: 'February 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-02-07', price: null, games: [
    'Book of Demons', 'CryoFall', 'Eliza', 'Frostpunk', 'Frostpunk: The Rifts', 'Night Call', 'Okami HD',
    'Pathfinder: Kingmaker — Enhanced Plus Edition', 'Project Warlock', 'SHENZHEN I/O', 'The Hex', 'Underhero',
    'Warstone TD'] },
  { name: 'Humble VR Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2020-02-11', price: null, games: [
    'Cosmic Trip', 'Smashbox Arena', 'Budget Cuts', 'GORN', 'Space Pirate Trainer', 'Moss', 'SUPERHOT VR'] },
  { name: 'Humble Digital Tabletop Bundle 2', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-02-18', price: null, games: [
    'Gremlins, Inc.', 'Reigns', 'Reigns: Her Majesty', 'Armello', 'For The King', 'Terraforming Mars',
    'Slay the Spire'] },
  { name: 'March 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-03-06', price: null, games: [
    '198X', 'AI War 2', 'Battle Chasers: Nightwar', "Death's Gambit: Afterlife", 'Etherborn', 'EXAPUNKS', 'F1 2019',
    "Fell Seal: Arbiter's Mark", 'My Friend Pedro', 'Niffelheim', 'Planet Coaster',
    "Planet Coaster - World's Fair Pack", 'Turok'] },
  { name: 'Humble Sakura Collection Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-03-10', price: null, games: [
    'Sakura Angels', 'Sakura Beach', 'Sakura Beach 2', 'Sakura Fantasy Chapter 1', 'Sakura MMO', 'Sakura Spirit',
    'Sakura Agent', 'Sakura Cupid', 'Sakura Gamer', 'Sakura Magical Girls', 'Sakura MMO 2', 'Sakura Sadist',
    'Sakura Shrine Girls', 'Sakura Space', 'Sakura Dungeon', 'Sakura Fox Adventure'] },
  { name: 'Humble Just Drive Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2020-03-12', price: null, games: [
    'MotoGP15', 'MXGP - The Official Motocross Videogame', 'WRC 7', 'DiRT 4', 'Project CARS Digital Pre-Purchase',
    'Road Redemption', 'Assetto Corsa + Dream Packs', 'NASCAR Heat 4', 'Project CARS 2 Prepurchase'] },
  { name: 'Humble Capcom MEGA Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2020-03-17', price: null, games: [
    'Mega Man Legacy Collection', 'Resident Evil 2 - All In-game Rewards Unlocked', 'Resident Evil Revelations 2',
    'Strider', 'Mega Man X Legacy Collection', 'Resident Evil 0', 'Resident Evil Revelations',
    'Resident Evil Revelations 2 Complete Season', 'Dead Rising 4', 'Devil May Cry 4 Special Edition',
    "Dragon's Dogma: Dark Arisen", 'Mega Man 11', 'Resident Evil', 'Street Fighter 30th Anniversary Collection'] },
  { name: 'Humble Software Bundle: Best of Stardock 2020', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-03-18', price: null, games: [
    'Start10', 'Fences 3', 'Groupy', 'Multiplicity'] },
  { name: 'Humble Award Winners Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-03-26', price: null, games: [
    'Diaries of a Spaceport Janitor', 'SIMULACRA', 'Quadrilateral Cowboy', "Yoku's Island Express", 'Owlboy',
    'SINNER: Sacrifice for Redemption', 'Yuppie Psycho'] },
  { name: 'Humble Conquer COVID-19 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-03-31', price: null, games: [
    'A Good Snowman Is Hard To Build', "A Mortician's Tale", 'Agents of Mayhem', 'Alien Spidy', 'Brütal Legend',
    'Broken Age', 'Brothers - A Tale of Two Sons', 'Darksiders II Deathinitive Edition',
    'Darksiders Warmastered Edition', 'DUCATI - 90th Anniversary', 'Europa Universalis IV',
    'Fahrenheit: Indigo Prophecy Remastered', 'GNOG', 'Hacknet', 'HIVESWAP: ACT 1', 'Hollow Knight'] },
  { name: 'April 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-04-03', price: null, games: [
    'Capitalism 2', 'Driftland: The Magic Revival', 'GRIS', 'HITMAN 2 - Standard Edition', 'MOLEK-SYNTEZ',
    'Opus Magnum', "Raiden V: Director's Cut", 'Shoppe Keep 2',
    "The Bard's Tale IV: Director's Cut + The Bard's Tale Trilogy", 'This Is the Police 2', 'Train Valley 2',
    'Truberbrook', 'Turok 2: Seeds of Evil'] },
  { name: 'Humble Stardock Strategy Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-04-07', price: null, games: [
    "Dead Man's Draw", 'Sorcerer King: Rivals', 'Galactic Civilizations III + 3 DLCs',
    'Ashes of the Singularity: Escalation', 'Galactic Civilizations III: Intrigue Expansion', 'Star Control I & II',
    'Star Control III', 'Star Control: Origins', 'Star Control: Origins - Earth Rising Expansion',
    'Star Control: Origins - Original Soundtrack'] },
  { name: "Humble 2K's Game Together Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2020-04-14', price: null, games: [
    'Carnival Games VR', "Sid Meier's Pirates!", 'Spec Ops: The Line', 'The Darkness II', 'BioShock: The Collection',
    'NBA 2K Playgrounds 2', "Sid Meier's Civilization III: Complete", 'The Golf Club 2019 Featuring PGA TOUR',
    'Borderlands GOTY Enhanced', 'Borderlands: The Handsome Collection', 'NBA 2K20', 'WWE 2K20',
    'XCOM: Enemy Unknown Complete Pack'] },
  { name: 'Humble Software Bundle: Work Remote', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-04-15', price: null, games: [
    'King of Dragon Pass', 'Warhammer 40,000: Space Wolf', 'Warhammer 40,000: Space Wolf - Fall of Kanak',
    'Warhammer 40,000: Space Wolf - Sentry Gun Pack', 'Action! - Gameplay Recording and Streaming', 'DisplayFusion',
    'Dreamfall: The Longest Journey', 'INSOMNIA: The Ark', 'Warhammer 40,000: Space Wolf - Saga of the Great Awakening',
    'Warhammer 40,000: Space Wolf - Wolf Priest'] },
  { name: 'Humble Square Enix Collective Bundle 2020', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-04-21', price: null, games: [
    'Deadbeat Heroes', 'Goetia', 'Octahedron: Transfixed Edition', 'Oh My Godheads', 'Black The Fall',
    'Fear Effect Sedna', 'Forgotton Anne', 'The Turing Test', 'BATTALION: Legacy', 'Boundless', 'Children of Zodiarcs',
    'Tokyo Dark'] },
  { name: 'Humble Sierra the 3rd Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-05-05', price: null, games: [
    'Gabriel Knight 3: Blood of the Sacred, Blood of the Damned', 'Police Quest Collection', 'TimeShift', 'Velocity 2X',
    'Arcanum', 'Caesar 4', 'Gabriel Knight 2: The Beast Within', 'Phantasmagoria 2', 'Quest for Glory Collection',
    'Shiftlings', 'Caesar 3', 'Gabriel Knight: Sins of the Fathers', 'Geometry Wars 3: Dimensions Evolved',
    "King's Quest - Season Pass", "King's Quest Collection", 'Phantasmagoria'] },
  { name: 'Humble Asmodee Digital Play With Friends Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-05-07', price: null, games: [
    'Carcassonne: The Official Board Game', 'King and Assassins', 'Love Letter', 'Patchwork', 'Potion Explosion',
    'Small World', 'Carcassonne - Traders & Builders', 'Mysterium', 'Small World 2 - Be Not Afraid...',
    'Small World 2 - Cursed!', 'Splendor', 'Splendor - The Cities', 'Splendor - The Trading Posts', 'Twilight Struggle',
    'Winter and Gingerbread Man - Expansion', 'Carcassonne - The Princess & the Dragon Expansion'] },
  { name: 'Humble Indie Bundle 21', store: 'Humble Bundle', kind: 'bundle', date: '2020-05-12', price: null, games: [
    'Beat Cop', 'Dustforce Game plus Soundtrack', 'Hotline Miami', 'Downwell', 'Gato Roboto', 'Moonlighter',
    'Hypnospace Outlaw', 'Starbound'] },
  { name: 'Humble BANDAI NAMCO Bundle 4', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-05-19', price: null, games: [
    'ENSLAVED: Odyssey to the West Premium Edition', 'GET EVEN', 'PAC-MAN 256', '.hack//G.U. Last Recode',
    'Katamari Damacy REROLL', 'RAD', 'Tales of Berseria', 'TEKKEN 7', 'The Dark Pictures Anthology: Man of Medan'] },
  { name: 'Humble Cities: Skylines Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-05-26', price: null, games: [
    'Cities: Skylines', 'Cities: Skylines - Deep Focus Radio', 'Cities: Skylines - After Dark',
    'Cities: Skylines - All That Jazz', 'Cities: Skylines - Concerts',
    'Cities: Skylines - Content Creator Pack: High-Tech Buildings', 'Cities: Skylines - Natural Disasters',
    'Cities: Skylines - Snowfall', 'Cities: Skylines - Campus', 'Cities: Skylines - Content Creator Pack: Art Deco',
    'Cities: Skylines - Content Creator Pack: European Suburbia', 'Cities: Skylines - Green Cities',
    'Cities: Skylines - Industries', 'Cities: Skylines - Mass Transit'] },
  { name: 'June 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-06-05', price: null, games: [
    'Barotrauma', 'Boundless', 'Felix the Reaper', 'GRID Ultimate Edition', "Hellblade: Senua's Sacrifice",
    'Men of War: Assault Squad 2 - War Chest Edition', 'Overload', 'Remnants of Naezith',
    'Stygian: Reign of the Old Ones', 'Supraland', "The King's Bird", 'The Messenger', 'The Stillness of the Wind'] },
  { name: 'Humble Plug In Digital & Dear Villagers Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-06-09', price: null, games: [
    'AWAY: Journey to the Unexpected', 'Impulsion', 'Splasher', 'Strikers Edge', 'Mana Spark', 'Old School Musical',
    'Roof Rage', "Streets of Red : Devil's Dare Deluxe", 'Dead In Vinland', 'Hover',
    "Sherlock Holmes: The Devil's Daughter"] },
  { name: 'Humble Codemasters Bundle 2020', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-06-11', price: null, games: [
    'GRID Autosport', 'Operation Flashpoint Complete', 'Overlord II', 'Toybox Turbos', 'DiRT 4', 'DiRT Rally',
    'F1 2018', 'HEADLINE CONTENT DLC PACK', 'Hyundai R5 rally car', 'Team Booster Pack', 'DiRT Rally 2.0', 'F1 2019'] },
  { name: 'Humble Fight for Racial Justice Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-06-16', price: null, games: [
    'A New Beginning - Final Cut', 'Age of Wonders III', 'All You Can Eat', 'Armello', 'Baba Is You',
    'BioShock + BioShock Remastered (14603)', 'Broken Age', 'Company of Heroes 2', 'Crowntakers',
    'Darkest Dungeon: The Shieldbreaker', 'EarthNight', 'Eastside Hockey Manager', 'Elite Dangerous',
    'Endless Space - Collection', 'Football Manager 2020', 'FRAMED Collection'] },
  { name: 'Humble PLAYISM Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-06-18', price: null, games: [
    'Ace of Seafood', 'Lost Technology', 'Mitsurugi Kamui Hikae', 'One Way Heroics', 'REVOLVER360 RE:ACTOR',
    'Unholy Heights', 'GOCCO OF WAR', 'Kero Blaster', 'LiEat', 'Mad Father', 'Astebreed: Definitive Edition',
    'BREAK ARTS II', 'Momodora: Reverie Under the Moonlight', 'The Silver Case'] },
  { name: 'Humble Nacon Publisher Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-06-23', price: null, games: [
    '2Dark', 'Aarklash: Legacy', 'Outcast - Second Contact', 'Of Orcs And Men', "Sherlock Holmes: The Devil's Daughter",
    'Styx: Master of Shadows', 'Tennis World Tour', 'V-Rally 4', 'FIA European Truck Racing Championship',
    'Pro Cycling Manager 2019', 'The Fisherman - Fishing Planet',
    'Truck Racing Championship - Indianapolis Motor Speedway'] },
  { name: 'Humble Summer Adventure Games Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-07-07', price: null, games: [
    'Batman: The Enemy Within - The Telltale Series', 'Oxenfree', 'The Walking Dead', 'The Walking Dead: 400 Days',
    'Batman - The Enemy Within Shadows Mode', 'The Walking Dead: Michonne', 'The Walking Dead: Season Two',
    'The Wolf Among Us', 'Batman - The Telltale Series', 'Batman - The Telltale Series Shadows Mode', "Heaven's Vault",
    'The Walking Dead: A New Frontier', 'The Walking Dead: The Final Season'] },
  { name: 'Humble Warhammer Bundle 2020', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-07-14', price: null, games: [
    'Legacy of Dorn: Herald of Oblivion', 'Warhammer 40,000: Dawn of War - Anniversary Edition',
    'Warhammer 40,000: Kill Team', 'Warhammer: End Times - Vermintide', 'Battlefleet Gothic: Armada',
    'Warhammer 40,000: Dawn of War II - Anniversary Edition', 'Warhammer 40,000: Deathwatch - Enhanced Edition',
    'Warhammer 40,000: Sanctus Reach', 'Blood Bowl 2 - Legendary Edition', 'Warhammer 40,000: Dawn of War III',
    'Warhammer 40,000: Space Marine Collection'] },
  { name: 'Humble Daedalic Bundle 2020', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-07-21', price: null, games: [
    'A Year Of Rain', 'Fire: Ungh’s Quest', 'The Night of the Rabbit', 'AER Memories of Old', 'CryoFall',
    'State of Mind', 'The Great Perhaps', 'Iratus: Lord of the Dead', 'Iron Danger',
    "Ken Follett's The Pillars of the Earth", 'The Suicide of Rachel Foster'] },
  { name: 'Humble Best Of Paradox Interactive Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-07-23', price: null, games: [
    'Age of Wonders III', 'Europa Universalis IV', 'Warlock - Master of the Arcane', 'Necropolis', 'Stellaris',
    'Victoria Collection (June 2015)', 'BATTLETECH Digital Deluxe Edition', 'Tyranny', 'Imperator: Rome'] },
  { name: 'Humble Raw Fury 2020 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-07-28', price: null, games: [
    'GoNNER', 'Kathy Rain', 'Tormentor❌Punisher', 'Dandara: Trials of Fear Edition', 'Kingdom: Classic',
    'Kingdom: New Lands Royal Edition (Dec 2017–present)', 'Uurnog Uurnlimited', 'Whispers of a Machine',
    'Bad North: Jotunn Edition', 'Mosaic', 'Night Call', 'Kingdom Two Crowns'] },
  { name: 'Humble Double Fine 20th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-07-30', price: null, games: [
    'Amnesia Fortnight 2012', 'Amnesia Fortnight 2014', 'Amnesia Fortnight 2017',
    'Double Fine Adventure! Complete Series - Deluxe Edition', 'Psychonauts', 'Brütal Legend',
    'Broken Age + Soundtrack', 'Costume Quest', 'Day of the Tentacle Remastered',
    "Hack 'n' Slash + Soundtrack (& Spacebase GIFT)", 'Iron Brigade', 'MASSIVE CHALICE',
    'Psychonauts in the Rhombus of Ruin', "Spacebase DF-9 (& Hack 'n' Slash GIFT)", 'Stacking', '140'] },
  { name: 'Humble Bohemia Interactive Bundle 2020', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-08-04', price: null, games: [
    'Arma X: Anniversary Edition', 'Carrier Command: Gaea Mission', 'Fairy Tale About Father Frost, Ivan and Nastya',
    'Take On Helicopters', 'Take On Mars', 'Arma 3', 'Original War', 'UFO: Afterlight', 'Ylands - Exploration Pack',
    'Arma 3 Apex', 'Arma 3 Jets', 'Arma 3 Marksmen', 'Arma 3 Tac-Ops Mission Pack', 'Arma 3 Contact', 'DayZ'] },
  { name: 'Humble Killing Floor Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-08-13', price: null, games: [
    'Killing Floor', 'Killing Floor 1 Bundle - $1 Tier DLC', 'Killing Floor 1 Beat the Average Tier DLC',
    'Killing Floor 2', 'Killing Floor 2 Beat the Average Tier Franchise Packs',
    'Killing Floor Bundle - Mid-Promo Addition DLC', 'Killing Floor 1 Bundle $ 15 Tier DLC',
    'Killing Floor 2 - $15 Tier Franchise', 'Killing Floor: Incursion'] },
  { name: 'Humble Headup Games Band Boost Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-08-18', price: null, games: [
    'Deadly 30', 'Doodle Derby', 'Dub Dash', 'Meridian: Squad 22', 'Meridian: Squad 22 - Soundtrack',
    'Pixel Heroes: Byte & Magic', 'Pixel Heroes: Byte & Magic - Soundtrack', 'Safety First!', 'Dead End Job',
    'SEUM: Speedrunners from Hell', 'SEUM: Speedrunners from Hell - Soundtrack', 'SEUM: The Drunk Side of the Moon',
    'Slime-san', 'Slime-san - Official Soundtrack', 'The Inner World Bundle', 'Everreach: Project Eden'] },
  { name: 'Humble 1C Publishing Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-09-01', price: null, games: [
    '7,62 High Calibre + 7,62 Hard Life', "Devil's Hunt", 'Gift of Parthax', 'Haimrik', 'Shiny', 'Codex of Victory',
    'Eternity: The Last Unicorn', 'Quantum Replica', 'Re-Legion', 'Realpolitiks', 'Through the Woods',
    'Conglomerate 451', 'Deep Sky Derelicts', 'Deep Sky Derelicts - New Prospects', "Fell Seal: Arbiter's Mark",
    'Stygian: Reign of the Old Ones'] },
  { name: 'Humble Super Simulation Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-09-03', price: null, games: [
    '911 Operator', 'Treasure Hunter Simulator', 'Elite Dangerous', 'Radio Commander', 'theHunter: Call of the Wild',
    'We. The Revolution', 'PC Building Simulator', 'theHunter: Call of the Wild™ - Silver Ridge Peaks'] },
  { name: 'Humble Totally Tropico Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-09-08', price: null, games: [
    'Tropico', 'Tropico 3 - Steam Special Edition', 'Tropico 3: Absolute Power', 'Tropico 4', 'Tropico 4 DLC Junta',
    'Tropico 4 DLC Quick-Dry-Cement', 'Tropico 4 Plantador DLC', 'Tropico 4: Apocalypse', 'Tropico 4: Propaganda',
    'Tropico 4: The Academy', 'Tropico 4: Vigilante', 'Tropico 4: Voodoo', 'Tropico 4: Megalopolis',
    'Tropico 4: Modern Times', 'Tropico 4: Pirate Heaven', 'Tropico 5'] },
  { name: 'Humble Unity Games & Game Dev Assets Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-09-09', price: null, games: [
    'Skybolt Zack', 'Aeronautica Imperialis: Flight Command', 'One Deck Dungeon'] },
  { name: 'Humble Better Futures Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-09-15', price: null, games: [
    'Agent A: A puzzle in disguise', 'Throne of Lies®: Medieval Politics', 'Torchlight', 'Road Redemption',
    'This War of Mine', 'Torchlight II', 'Vanquish', 'Knights of Pen and Paper I & II Collection', 'Mythic Ocean'] },
  { name: 'Humble You Can Pet The Dog Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-09-17', price: null, games: [
    'Beyond Eyes', 'Bulb Boy', 'Dog Sled Saga', 'Scribblenauts Unlimited', "Death's Gambit: Afterlife",
    'Shenmue I & II', 'Where the Water Tastes Like Wine', 'Blair Witch'] },
  { name: 'Humble CI Games 2020 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-09-22', price: null, games: [
    'Alien Rage - Unlimited', 'Art of Murder - Cards of Destiny', 'Chronicles of Mystery - The Tree of Life',
    'Chronicles of Mystery: The Scorpio Ritual', 'Dogfight 1942', 'Lords of the Fallen - Game of the Year Edition',
    'Sniper Ghost Warrior 3', 'Sniper Ghost Warrior 3 - All-terrain vehicle',
    'Sniper Ghost Warrior 3 - Sniper Rifle McMillan TAC-338A', 'Sniper Ghost Warrior 3 - Multiplayer Map Pack',
    'Sniper Ghost Warrior 3 - The Sabotage', 'Sniper Ghost Warrior Contracts',
    'Sniper Ghost Warrior Contracts - STURM BODYGUARD 9 - gun'] },
  { name: 'Humble One Special Day Bundle 2020', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-09-29', price: null, games: [
    'Idle Champions - Celeste Starter Pack', 'Smoke and Sacrifice', 'Surgeon Simulator: Anniversary Edition',
    'Battlezone', 'Portal Knights', 'Stronghold 2', 'Talisman - The City Expansion',
    'Talisman - The Frostmarch Expansion', 'Talisman - The Sacred Pool Expansion', 'Talisman: Digital Classic Edition',
    'DiRT Rally 2.0', 'Ogre', 'Portal Knights - Elves, Rogues, and Rifts'] },
  { name: 'October 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-10-02', price: null, games: [
    'Autonauts', 'Basement', 'Fae Tactics', 'Fantasy Blacksmith', 'GOAT OF DUTY', 'Iron Danger',
    'Lightmatter - Full Game', 'Shadows: Awakening', 'Sunless Sea', 'Sunless Skies', 'The Suicide of Rachel Foster',
    'The Uncertain: Episode 1 + Soundtrack and Artbook', 'Tropico 6 - El Prez Edition'] },
  { name: "Humble Let's Fight Bundle", store: 'Humble Bundle', kind: 'bundle', date: '2020-10-06', price: null, games: [
    'Divekick', 'Nidhogg', 'Stick Fight: The Game', 'Absolver', 'Overgrowth', 'RWBY: Grimm Eclipse', 'Injustice 2'] },
  { name: 'Bandai Namco BYOB: The Humble Store', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-10-08', price: null, games: [
    '.hack//G.U. Last Recode', '11-11 Memories Retold', 'DRAGON BALL FighterZ - Ultimate Edition',
    'DRAGON BALL XENOVERSE 2', 'ENSLAVED: Odyssey to the West Premium Edition', 'GET EVEN', 'GOD EATER 2 Rage Burst',
    'Little Nightmares', 'NARUTO TO BORUTO: SHINOBI STRIKER', 'Ni no Kuni II: Revenant Kingdom', 'Project CARS 2',
    'SOULCALIBUR VI', 'Tales of Berseria'] },
  { name: 'LEGO Build Your Own Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-10-12', price: null, games: [
    'LEGO Batman 3: Beyond Gotham Premium Edition', 'LEGO Batman Trilogy', 'LEGO DC Super-Villains Deluxe Edition',
    'LEGO Marvel Super Heroes 2 Deluxe Edition', "LEGO® MARVEL's Avengers", 'LEGO Batman 2: DC Super Heroes',
    'LEGO Batman 3: Beyond Gotham', 'LEGO Batman: The Videogame', 'LEGO City Undercover', 'LEGO DC Super-Villains',
    'LEGO Harry Potter: Years 1-4', 'LEGO Harry Potter: Years 5-7', 'LEGO Jurassic World', 'LEGO MARVEL Super Heroes',
    'LEGO MARVEL Super Heroes 2', 'LEGO STAR WARS: The Force Awakens'] },
  { name: 'Humble Worms! Worms! Worms! Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-10-15', price: null, games: [
    'Worms', 'Worms Blast', 'Worms Crazy Golf', 'Worms Pinball', 'Worms Reloaded', 'Worms Reloaded Fort Booster Pack',
    'Worms Reloaded Preorder DLC', 'Worms Reloaded Puzzle Pack', 'Worms Reloaded Retro Pack',
    'Worms Reloaded Time Attack Pack', 'Worms Ultimate Mayhem', 'Worms Ultimate Mayhem - Customization Pack DLC',
    'Worms Armageddon', 'Worms Clan Wars', 'Worms Revolution', 'Worms Ultimate Mayhem - Multi Player Pack'] },
  { name: 'Humble Thrills & Chills Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-10-20', price: null, games: [
    'DISTRAINT 2', 'DISTRAINT 2 - OST', 'Pacify', 'Blood: Fresh Supply', 'DARQ', 'Desolate', 'Detention', 'The Letter',
    'DUSK', 'Layers of Fear 2', 'The Blackout Club'] },
  { name: 'Humble Software Bundle: Game Dev Stem', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-10-28', price: null, games: [
    '001 Game Creator', "001 Game Creator - Dragon's Den Resource Pack",
    '001 Game Creator - Point & Click Adventure Kit', '001 Game Creator - Retro Fantasy Music Pack Volume 1'] },
  { name: 'November 2020 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2020-11-06', price: null, games: [
    'Crying Suns', 'Darksburg', 'Darksiders III', 'Darkwood Deluxe Edition', 'Imperator: Rome Deluxe Edition',
    'Little Misfortune', 'Rover Mechanic Simulator', 'Smile For Me', 'Townsmen - A Kingdom Rebuilt', 'TSIOQUE',
    'Yakuza Kiwami 2', 'Youropa'] },
  { name: 'Humble Fall VR Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2020-11-10', price: null, games: [
    'A-Tech Cybernetic VR', 'Archangel: Hellfire - Fully Loaded', 'Killing Floor: Incursion', 'Raw Data',
    'Creed: Rise to Glory', 'I Expect You To Die', 'The Walking Dead: Saints & Sinners', 'Zero Caliber VR'] },
  { name: 'Humble Sweet Farm Fall Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-11-17', price: null, games: [
    'Out There: Ω Edition', 'ToeJam & Earl: Back in the Groove', 'CHUCHEL Cherry Edition', 'Moonlighter', 'SUPERHOT',
    'A Hat in Time', 'Coffee Talk', 'Necronator: Dead Wrong', 'Sigma Theory'] },
  { name: 'Humble Explore & Expand Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-12-01', price: null, games: [
    'Halcyon 6: Lightspeed Edition', 'Rain of Reflections', 'Sins of a Solar Empire: Trinity',
    'Galactic Civilizations III + 3 DLCs', 'Starpoint Gemini Warlords', 'Stellaris - Galaxy Edition'] },
  { name: 'Humble Québec Indies Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-12-15', price: null, games: [
    'Aeolis Tournament', 'Leap of Fate', 'Toto Temple Deluxe', 'Crew 167: The Grand Block Odyssey', 'Epic Manager',
    'Jotun: Valhalla Edition', 'Knight Squad', 'Light Fall', 'Operation: Tango - Demo', 'Castle Story',
    'Mages of Mystralia', 'Speed Brawl', 'Tales from Candlekeep: Tomb of Annihilation'] },
  { name: 'Humble Winter Indie Mix Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-12-17', price: null, games: [
    'BUTCHER', 'Deponia: The Complete Journey', 'LYNE', 'Cat Quest', 'Feather', 'Felix the Reaper', 'Armello',
    'CryoFall'] },
  { name: 'Humble Codemasters Racing Rebundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-12-22', price: null, games: [
    'Operation Flashpoint Complete', 'Overlord II', 'Toybox Turbos', 'DiRT 4', 'DiRT Rally', 'F1 2018',
    'F1 2018 HEADLINE EDITION', 'Hyundai R5 rally car', 'Team Booster Pack', 'DiRT Rally 2.0', 'F1 2019',
    'GRID (2019)'] },
  { name: 'Humble Holiday in Space Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-12-24', price: null, games: [
    'Space Run', 'Tacoma', 'Deep Sky Derelicts', 'Rover Mechanic Simulator', 'Siege of Centauri', 'AVICII Invector',
    'Breathedge', 'Moons of Madness'] },
  { name: 'Humble Software Bundle: Organize Your PC', store: 'Humble Bundle', kind: 'bundle',
    date: '2020-12-31', price: null, games: [
    'CursorFX', 'Start10', 'Fences 3', 'Groupy', 'Multiplicity', 'SoundPackager 10'] },
  { name: 'January 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-01-01', price: null, games: [
    'Ancestors: The Humankind Odyssey', 'Deleveled', 'Minoria', 'Not Tonight', 'Pathologic 2', 'PC Building Simulator',
    'SONG OF HORROR COMPLETE EDITION', 'Tales of the Neon Sea', 'The Ambassador: Fractured Timelines',
    'Total Tank Simulator', 'Vampire: The Masquerade - Shadows of New York', 'Warhammer: Chaosbane'] },
  { name: 'Humble Built to Survive Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-01-21', price: null, games: [
    'Deadly Days', 'Generation Zero®', 'Life is Feudal: Your Own', 'Mad Max', 'Memories of Mars',
    'Genesis Alpha One Deluxe Edition'] },
  { name: 'Humble Asmodee Digital Tabletop 2gether Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-02-04', price: null, games: [
    'Love Letter', 'Pandemic - On the Brink: Virulent Strain', 'Pandemic: The Board Game', 'Small World',
    'Small World 2 - Grand Dames', 'Pandemic - On the Brink: Roles and Events', 'Small World 2 - Be Not Afraid...',
    'Splendor', 'Splendor - The Cities', 'Splendor - The Strongholds', 'Ticket to Ride', 'Ticket To Ride - France',
    'Ticket to Ride - Legendary Asia', 'Blood Rage: Digital Edition', 'Small World 2 - Cursed!', 'Terraforming Mars'] },
  { name: 'February 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-02-05', price: null, games: [
    'Boomerang Fu', 'ENDLESS™ Space 2', 'Iris and the giant', 'Moving Out', 'Outward', 'Outward - The Soroboreans',
    'Outward Soundtrack', 'The Wild Eight', 'Train Station Renovation', 'Trine 4: The Nightmare Prince', 'Valfaris',
    'Valkyria Chronicles 4 Complete Edition', 'Werewolf: The Apocalypse - Heart of the Forest'] },
  { name: 'Humble Train Sim Expedition Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-02-09', price: null, games: [
    'Train Simulator 2021 Store & Humble Bundle package', 'Train Simulator: Amtrak Acela Express EMU Add-On',
    "Train Simulator: BR Class 421 '4CIG' Loco Add-On", 'Train Simulator: Class 67 Diamond Jubilee Loco Add-On',
    'Train Simulator: DB BR423 EMU Add-On', 'Train Simulator: Thompson Class B1 Add-On',
    'Train Simulator: BR Class 14 Loco Add-On', 'Train Simulator: DB BR 474.3 EMU Add-On',
    'Train Simulator: DB ICE 1 EMU Add-On', 'Train Simulator: Norfolk Southern SD40-2 High Nose Loco Add-On',
    'Train Simulator: Strathclyde Class 101 DMU Add-On', 'Train Simulator: Union Pacific Challenger Loco Add-On',
    'Train Simulator: Amtrak HHP-8 Loco Add-On', 'Train Simulator: BR Blue Diesel Electric Pack',
    'Train Simulator: DB ICE 3 EMU Add-On', 'Train Simulator: Miami Commuter Rail F40PHL-2 Loco Add-On'] },
  { name: 'Humble Plug In (And Play!) Digital Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-02-16', price: null, games: [
    'Anarcute', 'Hover', 'NeuroVoider', 'Chroma Squad', 'Dead In Vinland', 'Epistory - Typing Chronicles',
    'Plane Mechanic Simulator', 'Sundered: Eldritch Edition', 'Sigma Theory', 'Tennis World Tour',
    'TT Isle of Man: Ride on the Edge', 'WRC 8 FIA World Rally Championship'] },
  { name: 'Humble Tales of Love & Adventure Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-02-23', price: null, games: [
    'Tales of Monkey Island Complete Pack', 'Batman - The Enemy Within Shadows Mode', 'Batman - The Telltale Series',
    'Batman - The Telltale Series Shadows Mode', 'Batman: The Enemy Within - The Telltale Series', 'Half Past Fate',
    'Neo Cab', 'Reventure', 'Blacksad: Under the Skin', 'HIVESWAP: ACT 2', 'Indivisible'] },
  { name: 'Humble Stardock Wayfarers Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-02-25', price: null, games: [
    'Fallen Enchantress: Legendary Heroes', 'Sins of a Solar Empire: Rebellion',
    'Ashes of the Singularity: Escalation (includes Classic)', 'Siege of Centauri', 'The Political Machine 2020',
    'Offworld Trading Company - Limited Supply DLC', "Offworld Trading Company Core Edition+Jupiter's Forge Expansion",
    'Star Control I & II', 'Star Control III', 'Star Control: Origins',
    'Star Control: Origins - Earth Rising Expansion', 'Star Control: Origins - Original Soundtrack'] },
  { name: 'March 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-03-02', price: null, games: [
    'Ageless', 'Boreal Blade', 'Control', 'Cyber Hook', 'ELEX', 'Hotshot Racing', 'Kingdom Two Crowns',
    'Peaky Blinders: Mastermind', 'Pesterquest', 'Wildfire', 'WWE 2K BATTLEGROUNDS', 'XCOM: Chimera Squad'] },
  { name: 'Humble Stellaris Discovery Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-03-10', price: null, games: [
    'Stellaris', 'Stellaris: Leviathans Story Pack', 'Stellaris: Plantoids Species Pack', 'Stellaris: Utopia',
    'Stellaris: Ancient Relics Story Pack', 'Stellaris: Apocalypse', 'Stellaris: MegaCorp',
    'Stellaris: Synthetic Dawn'] },
  { name: 'Humble Curve Digital Supply-Drop Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-03-17', price: null, games: [
    'Hue', 'The Flame in the Flood', 'Manual Samuel - Last Tuesday Edition', 'Table Manners', 'When Ski Lifts Go Wrong',
    'American Fugitive', 'Autonauts', 'Bomber Crew', 'For The King', 'Narcos: Rise of the Cartels',
    'Space Crew: Legendary Edition'] },
  { name: 'Humble Daedalic 15th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-03-19', price: null, games: [
    '1954 Alcatraz', 'A New Beginning - Final Cut', 'A Year Of Rain', "Anna's Quest", 'Blackguards', 'Blackguards 2',
    'Chaos on Deponia', 'Deponia', 'Deponia Doomsday', "Edna & Harvey: Harvey's New Eyes",
    'Edna & Harvey: The Breakout', 'Fire: Ungh’s Quest', 'Goodbye Deponia', 'Memoria', 'Silence', 'State of Mind'] },
  { name: 'Humble Burn Rubber Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2021-03-26', price: null, games: [
    'Absolute Drift', 'DiRT Rally 2.0', 'GRIP: Combat Racing', 'Pacer', 'Assetto Corsa Special Bundle', 'KartKraft',
    'Monster Truck Championship', 'NASCAR Heat 5', 'NASCAR Heat 5 - Playoff Pack'] },
  { name: 'April 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-04-06', price: null, games: [
    'Aven Colony', 'Colt Canyon', 'F1 2020', 'In Other Waters', 'Main Assembly', 'Popup Dungeon',
    'Remothered: Broken Porcelain', 'Rock of Ages 3: Make & Break', 'Shenmue III', 'SIMULACRA', 'SIMULACRA 2', 'Skully',
    'Sniper Ghost Warrior Contracts'] },
  { name: 'Humble Spring Into VR Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-04-07', price: null, games: [
    'Detached', 'Espire 1: VR Operative', 'Star Trek: Bridge Crew', 'Surgeon Simulator: Experience Reality',
    'Swords of Gurrah', 'Borderlands 2 VR', 'Job Simulator', 'Sairento VR'] },
  { name: 'Humble Down to Earth Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-04-16', price: null, games: [
    'Figment', 'Yono and the Celestial Elephants', 'ABZÛ', "ARIDA: Backland's Awakening",
    'Never Alone (Kisima Ingitchuna)', 'Beyond Blue', 'Lost Ember', 'Summer in Mara'] },
  { name: 'Humble New Couch Classics Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-04-21', price: null, games: [
    'Door Kickers: Action Squad', '20XX', 'Nine Parchments', 'Ultimate Chicken Horse', 'Biped', 'Lethal League Blaze',
    'Wargroove'] },
  { name: 'Humble LEGO Built To Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-04-23', price: null, games: [
    'The LEGO NINJAGO Movie Video Game', 'LEGO Marvel Super Heroes 2 Deluxe Edition', "LEGO® MARVEL's Avengers",
    'LEGO Batman 2: DC Super Heroes', 'LEGO Worlds', 'LEGO Batman 3: Beyond Gotham Premium Edition',
    'LEGO DC Super-Villains Deluxe Edition'] },
  { name: 'May 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-05-04', price: null, games: [
    'Cook, Serve, Delicious! 3?!', 'Darksiders Genesis', 'Fury Unleashed', 'Hellpoint', 'Levelhead', 'Metro Exodus',
    'Morkredd', 'Relicta', 'Retimed', 'Size Matters', 'Vane'] },
  { name: 'Humble Heal: Covid-19 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-05-12', price: null, games: [
    'Baba Is You', 'BioShock Remastered', 'Brütal Legend', 'Bury me, my Love', 'Crusader Kings Complete',
    'Dead In Bermuda', 'Death Squared', 'Dwarfs!?', 'Euro Truck Simulator 2', 'Hyper Light Drifter', 'Into the Breach',
    'Pinstripe', 'Portal Knights', 'Saints Row: The Third - The Full Package', 'Stick Fight: The Game', 'SUPERHOT'] },
  { name: 'Humble DeckBuild & Battle Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-05-14', price: null, games: [
    'Thea: The Awakening', 'Cultist Simulator', 'SteamWorld Quest: Hand of Gilgamech', 'Fantasy General II',
    'Imperator: Rome', 'NEOVERSE', 'Thea 2: The Shattering'] },
  { name: 'Humble Best of BANDAI NAMCO Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-05-19', price: null, games: [
    'PAC-MAN 256', 'Little Nightmares Complete Edition', 'RAD', 'Tales of Zestiria', 'Katamari Damacy REROLL',
    'Tales of Berseria', 'TEKKEN 7', 'CODE VEIN', 'Project CARS 3'] },
  { name: 'Humble Guilty Gear Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2021-05-26', price: null, games: [
    'Guilty Gear Isuka', 'Guilty Gear X2 #Reload', 'GUILTY GEAR', 'GUILTY GEAR 2 -OVERTURE-',
    'GUILTY GEAR XX ACCENT CORE PLUS R', 'GUILTY GEAR Xrd -REVELATOR- Deluxe Edition',
    'GUILTY GEAR Xrd -SIGN- Big Blast Bundle', 'GUILTY GEAR Xrd REV 2 Upgrade'] },
  { name: 'Humble Rising Storm Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-05-26', price: null, games: [
    'Red Orchestra: Ostfront 41-45', 'Red Orchestra 2 - Digital Deluxe Edition (ROW)', 'Rising Storm 2: Vietnam',
    'Rising Storm 2: Vietnam - Pulling Rank Cosmetic DLC', 'Rising Storm 2: Vietnam - Born in the USA Cosmetic DLC',
    'Rising Storm 2: Vietnam - Green Army Men Upgrade', 'Rising Storm 2: Vietnam - Homeland Security Cosmetic DLC',
    'Rising Storm 2: Vietnam - Man Down Under Cosmetic DLC',
    'Rising Storm 2: Vietnam - Personalized Touch Cosmetic DLC', 'Rising Storm 2: Vietnam - Rear Echelon Cosmetic DLC',
    "Rising Storm 2: Vietnam - Sgt Joe's Support Bundle Cosmetic DLC",
    'Rising Storm 2: Vietnam - Southern Style Cosmetic DLC', 'Rising Storm 2: Vietnam - Specialist Pack DLC',
    "Rising Storm 2: Vietnam - Uncle Ho's Heroes Cosmetic DLC"] },
  { name: 'June 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-06-01', price: null, games: [
    'Desolate', 'Effie', 'Going Under', 'Ikenfell', 'Milky Way Prince – The Vampire Star', 'Panzer Paladin',
    'Paw Paw Paw', 'Secret Neighbor', "Sid Meier's Civilization VI : Platinum Edition",
    'Stubbs the Zombie in Rebel Without a Pulse', 'Worms Rumble', 'Worms Rumble - Legends Pack'] },
  { name: 'Humble Out in the Open World Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-06-11', price: null, games: [
    'AER Memories of Old', 'Hurtworld', 'Kingdom Come: Deliverance - Treasures of the Past', 'Supraland',
    'Yooka-Laylee', 'Borderlands GOTY Enhanced', 'Kingdom Come: Deliverance'] },
  { name: 'Humble UK Games Collective Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-06-16', price: null, games: [
    "Her Majesty's SPIFFING", 'Lumino City', 'Master Reboot', 'The Ship - Complete Pack',
    'Warhammer 40,000: Sanctus Reach', 'Old School RuneScape 1-Month Membership'] },
  { name: 'July 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-07-06', price: null, games: [
    'ADOM (Ancient Domains Of Mystery)', 'Bee Simulator', 'Deadly Days', 'DIRT 5', 'ELDERBORN Metal AF Edition',
    'Hammerting', 'Kill It With Fire', 'Nimbatus - The Space Drone Constructor', 'Paradise Killer', 'SWINE HD Remaster',
    'The Surge 2', 'Yakuza 3 Remastered'] },
  { name: 'Humble Unleash  Destruction Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-07-09', price: null, games: [
    'Master of Magic Classic', 'Battlestar Galactica Deadlock', 'Distant Worlds: Universe', 'Field of Glory II',
    'Strategic Command WWII: World at War', 'Warhammer 40,000: Gladius - Fortification Pack',
    'Warhammer 40,000: Gladius - Relics of War', 'Warhammer 40,000: Gladius - Tyranids'] },
  { name: 'Humble Take Control Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-07-14', price: null, games: [
    'SimplePlanes', 'Elite Dangerous', 'Overload', 'EVE: Valkyrie - Warzone', 'Heliborne Collection',
    'Rebel Galaxy Outlaw'] },
  { name: 'Sakura Series Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2021-07-16', price: null, games: [
    'Sakura Agent', 'Sakura Gamer', 'Sakura Sadist', 'Sakura Shrine Girls', 'Sakura Space', 'Sakura Fox Adventure',
    'Sakura Gamer 2', 'Sakura MMO 3', 'Sakura Nova', 'Sakura Swim Club', 'Sakura Dungeon', 'Sakura Knight 2',
    'Sakura Knight 3', 'Sakura Succubus', 'Sakura Succubus 2', 'Sakura Succubus 3'] },
  { name: 'Humble Hearts of Iron IV Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-07-21', price: null, games: [
    'Hearts of Iron IV: Cadet Edition', 'Hearts of Iron IV: Death or Dishonor',
    'Hearts of Iron IV: Together for Victory', 'Music - Hearts of Iron IV: Radio Pack',
    'Cosmetic Pack - Hearts of Iron IV: Axis Armor', 'Country Pack - Hearts of Iron IV: Battle for the Bosporus',
    'Hearts of Iron IV: Man the Guns', 'Hearts of Iron IV: Waking the Tiger'] },
  { name: "Humble's Early Access All-Stars Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2021-07-28', price: null, games: [
    'Retrowave', 'Golf It!', 'The Infected', 'Luck be a Landlord', 'Snowtopia', 'Warpips'] },
  { name: 'Humble RPG Heroes Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2021-07-30', price: null, games: [
    'Delver', 'Swords & Souls: Neverseen', 'Tower of Time', 'Dreadlands', 'Quest Hunter', "Slasher's Keep"] },
  { name: 'August 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-08-03', price: null, games: [
    'As Far As The Eye', 'Blue Fire', 'Carto', 'Cepheus Protocol', 'Drake Hollow', 'Last Oasis', 'Nowhere Prophet',
    'Out of Space', 'Superliminal', 'We Need To Go Deeper'] },
  { name: 'Humble Remarkable Roguelikes Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-08-04', price: null, games: [
    'Blazing Beaks', 'Curious Expedition', 'Dungreed', 'SYNTHETIK', 'EVERSPACE', 'Hero Siege',
    'Hero Siege - Amazon (Class)', 'Hero Siege - Avenger Paladin (Class + Skin)', 'Hero Siege - Class - Plague Doctor',
    'Hero Siege - Cyberpunk Samurai (Class + Skin)', 'Hero Siege - Demon Slayer Bundle + Spawn Skin (Class)',
    'Hero Siege - Extra slots & stash space', 'Hero Siege - Marauder (Class)', 'Hero Siege - Shaman (Class)',
    'Hero Siege - Shield Lancer (Class)', 'Heroes of Hammerwatch'] },
  { name: 'Humble Big Brain Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2021-08-11', price: null, games: [
    'I’m not a Monster', 'No Time to Relax', '5D Chess With Multiverse Time Travel', '7 Billion Humans',
    'The Battle of Polytopia', 'BATTLETECH', 'XCOM 2', 'XCOM 2: Reinforcement Pack'] },
  { name: 'Humble Jackbox Summer Party Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-08-13', price: null, games: [
    "YOU DON'T KNOW JACK Vol. 1 XL", "YOU DON'T KNOW JACK Vol. 2", "YOU DON'T KNOW JACK Vol. 3", 'Drawful 2',
    'Fibbage XL', 'Quiplash', 'The Jackbox Party Pack', 'The Jackbox Party Pack 2', "YOU DON'T KNOW JACK HEADRUSH",
    "YOU DON'T KNOW JACK MOVIES", "YOU DON'T KNOW JACK SPORTS", "YOU DON'T KNOW JACK TELEVISION",
    "YOU DON'T KNOW JACK Vol. 4 The Ride", 'The Jackbox Party Pack 3', 'The Jackbox Party Pack 4',
    'The Jackbox Party Pack 5'] },
  { name: 'Humble Seven Deadly Sims Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-08-18', price: null, games: [
    'Bridge Constructor Portal', 'Police Stories', 'theHunter: Call of the Wild', 'Total Tank Simulator',
    'Ancestors: The Humankind Odyssey', 'Lobotomy Corporation', 'Tank Mechanic Simulator'] },
  { name: 'Humble Best of Stealth Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-08-25', price: null, games: [
    'Aragami', 'ECHO', 'Heat Signature', 'Styx: Shards of Darkness', 'Ghost of a Tale',
    'HITMAN: Game of the Year Edition', 'HITMAN 2 - Gold Edition'] },
  { name: 'Humble Unity Fantasy Games & Game Dev Assets Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-09-01', price: null, games: [
    'Minute of Islands', 'Waking'] },
  { name: 'Humble Humongous Back to School Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-09-03', price: null, games: [
    'Big Thinkers 1st Grade', 'Big Thinkers Kindergarten', "Fatty Bear's Birthday Surprise",
    "Let's Explore The Airport (Junior Field Trips)", "Let's Explore The Farm (Junior Field Trips)",
    "Let's Explore The Jungle (Junior Field Trips)", "Putt-Putt and Fatty Bear's Activity Pack",
    "Putt-Putt and Pep's Balloon-o-Rama", "Putt-Putt and Pep's Dog on a Stick", "Putt-Putt: Pep's Birthday Surprise",
    'SPY Fox in: Cheese Chase', 'Freddi Fish 2: The Case of the Haunted Schoolhouse',
    'Pajama Sam 4: Life Is Rough When You Lose Your Stuff!', 'Pajama Sam: Games to Play on Any Day',
    "Pajama Sam's Lost & Found", "Pajama Sam's Sock Works"] },
  { name: 'September 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-09-07', price: null, games: [
    'Atomicrops', 'Fort Triumph', 'FRAMED Collection', "Heaven's Vault", 'Narita Boy', 'Neon Abyss',
    'Not For Broadcast', 'Orwell: Ignorance is Strength', 'PGA TOUR 2K21', 'Röki', 'Swag and Sorcery',
    'West of Dead'] },
  { name: 'Humble Team 17 Greatest Hits Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-09-08', price: null, games: [
    'Mugsters', 'Overruled!', 'Ageless', 'Alien Breed Trilogy', 'Aven Colony', 'Flockers', 'Golf With Your Friends',
    'Sheltered', 'The Escapists', 'Overcooked', 'Overcooked - The Lost Morsel', 'The Escapists - Alcatraz',
    'The Escapists - Escape Team', 'Worms Rumble', 'Worms Rumble - Legends Pack',
    'Worms Rumble - New Challengers Pack'] },
  { name: 'Humble Telltale Games Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-09-10', price: null, games: [
    'The Walking Dead', 'The Walking Dead: 400 Days', 'Batman - The Telltale Series', 'The Walking Dead: Michonne',
    'The Walking Dead: Season Two', 'Batman - The Enemy Within Shadows Mode',
    'Batman - The Telltale Series Shadows Mode', 'Batman: The Enemy Within - The Telltale Series',
    'The Walking Dead: A New Frontier', 'The Walking Dead: The Final Season', 'The Wolf Among Us'] },
  { name: 'Humble Be the Bad Guy Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-09-15', price: null, games: [
    'POSTAL Redux', 'Dungeons 3', 'POSTAL 2', 'POSTAL 2: Paradise Lost', 'Legend of Keepers',
    'Mafia II: Definitive Edition', 'Mafia III: Definitive Edition'] },
  { name: 'Humble Unity FPS Games & Game Dev Assets Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-09-16', price: null, games: [
    'Tannenberg', 'Verdun'] },
  { name: 'Humble Fall VR Emporium Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-09-17', price: null, games: [
    'Wands', "A Fisherman's Tale", 'Paper Beast', 'Zero Caliber VR', 'Arizona Sunshine', 'House Flipper VR',
    'Until You Fall'] },
  { name: 'Humble Tropico 20th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-09-22', price: null, games: [
    'Tropico 3: Gold Edition', "Tropico 4 Collector's Bundle", 'Tropico 5 - Complete Collection',
    'Tropico 6 - Caribbean Skies', 'Tropico 6 - El Prez Edition', 'Tropico 6 - Lobbyistico', 'Tropico 6 - Spitter',
    'Tropico 6 - The Llama of Wall Street'] },
  { name: 'Humble Software Bundle: Convert, Edit, Record your Photos, Videos and Gameplay', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-09-23', price: null, games: [
    'Gecata by Movavi 5 - Game Recording Software', 'Movavi Picverse', 'Movavi Screen Recorder 2023',
    'Movavi Video Editor Plus 2021', 'Movavi Video Editor Plus 2021 - Cinematic Set',
    'Movavi Video Editor Plus 2021 - Magic World Set', 'Movavi Video Editor Plus 2021 - VHS Intro Pack',
    'Movavi Video Converter 2024'] },
  { name: 'Humble Dream Teams Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2021-09-24', price: null, games: [
    'Primal Carnage: Extinction', 'Shift Happens', 'Trine 2: Complete Story',
    "Warhammer: End Times - Vermintide Collector's Edition", 'Survive the Nights', 'Trailmakers Deluxe Edition'] },
  { name: 'October 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-10-05', price: null, games: [
    '112 Operator', 'Amnesia: Rebirth', "Black Future '88", 'GARAGE: Bad Trip', 'Guts and Glory', 'Hiveswap Friendsim',
    'John Wick Hex', 'Katana ZERO', 'Ring of Pain', 'Syberia 3', 'The Textorcist: The Story of Ray Bibbia',
    'Tools Up!'] },
  { name: 'Humble Play Pink, The Best Of Asmodee Digital Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-10-08', price: null, games: [
    'Love Letter', 'Pandemic - On the Brink: Roles and Events', 'Pandemic: The Board Game', 'Small World',
    'Small World 2 - Cursed!', 'Carcassonne: The Official Board Game', "Small World - A Spider's Web",
    'Small World 2 - Royal Bonus', 'Splendor', 'Ticket to Ride', 'Ticket to Ride - India',
    'Ticket to Ride - Nordic Countries', 'Ticket to Ride - Switzerland', 'Ticket to Ride - United Kingdom',
    'Ticket to Ride - USA 1910', 'A Game of Thrones: The Board Game'] },
  { name: 'Humble theHunter: Call of the Wild Complete Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-10-15', price: null, games: [
    'theHunter: Call of the Wild', 'theHunter: Call of the Wild - ATV',
    'theHunter: Call of the Wild - Duck and Cover Pack', 'theHunter: Call of the Wild - Medved-Taiga',
    'theHunter: Call of the Wild - Parque Fernando', 'theHunter: Call of the Wild - Tents & Ground Blinds',
    'theHunter: Call of the Wild - Trophy Lodge Spring Creek Manor', 'theHunter: Call of the Wild - Vurhonga Savanna',
    'theHunter: Call of the Wild - Weapon Pack 1', 'theHunter: Call of the Wild - Weapon Pack 2',
    'theHunter: Call of the Wild - Wild Goose Chase Gear', 'theHunter: Call of the Wild - High-Tech Hunting Pack',
    'theHunter: Call of the Wild - Saseka Safari Trophy Lodge', 'theHunter: Call of the Wild - Treestand & Tripod Pack',
    'theHunter: Call of the Wild - Weapon Pack 3', 'theHunter: Call of the Wild - Yukon Valley'] },
  { name: 'Fighting Juggernauts Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-10-20', price: null, games: [
    'One Finger Death Punch 2', 'Mortal Kombat XL', 'Slap City', 'Injustice 2 Legendary Edition',
    'Killer Instinct: Anniversary Edition', 'Power Rangers: Battle for the Grid', 'SOULCALIBUR VI'] },
  { name: 'Humble Paradox StrataGems Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-10-22', price: null, games: [
    'Ice Lakes', 'Knights of Pen and Paper 2', 'Victoria II', 'Crusader Kings II: Dynasty Starter Pack',
    'Prison Architect', 'Prison Architect - Island Bound', "Prison Architect - Psych Ward: Warden's Edition", 'Tyranny',
    'Age of Wonders: Planetfall', 'Empire of Sin', 'Imperator: Rome'] },
  { name: 'Humble Sonic 30th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-10-27', price: null, games: [
    'Sonic Adventure DX', 'Sonic Adventure 2: Battle Mode DLC', 'Sonic Adventure™ 2', 'Sonic and SEGA All Stars Racing',
    'SONIC THE HEDGEHOG 4 Episode I', 'SONIC THE HEDGEHOG 4 Episode II',
    'Sonic & All-Stars Racing Transformed Collection', 'Sonic Generations', 'Sonic Lost World',
    'Sonic Mania - Encore DLC', 'Sonic Forces', 'Sonic Mania', 'Team Sonic Racing'] },
  { name: 'Humble Aspyr 25th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-10-29', price: null, games: [
    'Fahrenheit: Indigo Prophecy Remastered', 'Layers of Fear: Masterpiece Edition', 'Lightmatter', 'Morkredd',
    'BioShock Infinite', 'Bioshock Infinite Season Pass ROW', 'Borderlands: The Handsome Collection',
    'Civilization: Beyond Earth – The Collection'] },
  { name: 'November 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-11-02', price: null, games: [
    'BPM: BULLETS PER MINUTE', 'Due Process', 'House Flipper', 'Juno: New Origins', "Möbius Front '83",
    'Project Wingman', 'Timelie', 'Turnip Boy Commits Tax Evasion', 'Wingspan', 'WRATH: Aeon of Ruin'] },
  { name: 'Humble Survive or Die Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-11-03', price: null, games: [
    'How to Survive 2', 'Dead In Vinland', 'Die Young', 'Empyrion - Galactic Survival', 'Breathedge', 'SCUM',
    'The Wild Eight'] },
  { name: 'Humble Adrenaline Rush Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-11-05', price: null, games: [
    'Lead and Gold - Gangs of the Wild West', 'Cygon Customisation Pack', 'GRIP: Combat Racing',
    'Keep Talking and Nobody Explodes', 'Miscreated', 'Nyvoss Customisation Pack', 'Terra Customisation Pack',
    'Vintek Customisation Pack', 'BIGFOOT', 'Second Extinction™', 'Visage'] },
  { name: 'Leisure Suit Larry Collection Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-11-10', price: null, games: [
    'Leisure Suit Larry 1 - In the Land of the Lounge Lizards',
    'Leisure Suit Larry 2 - Looking For Love (In Several Wrong Places)',
    'Leisure Suit Larry 3 - Passionate Patti in Pursuit of the Pulsating Pectorals',
    'Leisure Suit Larry - Magna Cum Laude Uncut and Uncensored', "Leisure Suit Larry - Wet Dreams Don't Dry",
    "Leisure Suit Larry - Wet Dreams Don't Dry Artbook", "Leisure Suit Larry - Wet Dreams Don't Dry Soundtrack",
    'Leisure Suit Larry - Wet Dreams Dry Twice', 'Leisure Suit Larry - Wet Dreams Dry Twice Soundtrack',
    'Leisure Suit Larry 5 - Passionate Patti Does a Little Undercover Work',
    'Leisure Suit Larry 6 - Shape Up Or Slip Out', 'Leisure Suit Larry 7 - Love for Sail'] },
  { name: 'Humble Nacon Space, Sports, & Orcs Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-11-17', price: null, games: [
    'Styx: Master of Shadows', 'Mordheim: City of the Damned', 'Outcast - Second Contact', 'Street Power Football',
    'Warhammer: Chaosbane', 'Blood Bowl 2 - Legendary Edition', 'Hunting Simulator 2', 'Rugby 20',
    'Tour de France 2020'] },
  { name: 'Humble Choose Wisely Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-11-19', price: null, games: [
    'Beholder 2', 'Between the Stars', 'Kyle is Famous: Complete Edition', 'We Were Here Together', 'Beyond: Two Souls',
    'Heavy Rain'] },
  { name: 'Humble Best of Sandbox Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-11-24', price: null, games: [
    'People Playground', 'Besiege', 'Main Assembly', 'Kerbal Space Program', 'Totally Accurate Battle Simulator',
    'Space Haven', 'Universe Sandbox'] },
  { name: 'Humble Akupara 5 Year Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-11-26', price: null, games: [
    'Chicken Assassin: Reloaded', 'Keep in Mind: Remastered', "The Crow's Eye",
    'The Metronomicon - Chiptune Challenge Pack 1', 'The Metronomicon - Chiptune Challenge Pack 2',
    'The Metronomicon - Indie Game Challenge Pack 1', 'The Metronomicon - J-Punch Challenge Pack',
    'The Metronomicon - The End Records Challenge Pack', 'The Metronomicon: Slay The Dance Floor', 'Whispering Willows',
    'Gone Viral', 'Mutazione', 'Spinch', 'The Darkside Detective'] },
  { name: 'Humble The WB Batman Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-12-01', price: null, games: [
    'Batman: Arkham Asylum GOTY Edition', 'LEGO Batman: The Videogame', 'Batman: Arkham City GOTY', 'Batman: Arkham VR',
    'LEGO Batman 2: DC Super Heroes', 'Batman: Arkham Knight Premium Edition', 'Batman: Arkham Origins',
    'LEGO Batman 3: Beyond Gotham'] },
  { name: 'Humble Digitized Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2021-12-03', price: null, games: [
    'Solitairica', '100% Orange Juice', '100% Orange Juice - Acceleration Pack',
    '100% Orange Juice - Alte & Kyoko Character Pack', '100% Orange Juice - Core Voice Pack 1',
    '100% Orange Juice - Core Voice Pack 2', '100% Orange Juice - Krila & Kae Character Pack',
    '100% Orange Juice - Mixed Booster Pack', '100% Orange Juice - Saki & Kyousuke Character Pack',
    '100% Orange Juice - Starter Character Voice Pack', '100% Orange Juice - Syura & Nanako Character Pack',
    "Meteorfall: Krumit's Tale", 'Talisman - The City Expansion', 'Talisman - The Frostmarch Expansion',
    'Talisman - The Sacred Pool Expansion', 'Talisman: Digital Classic Edition'] },
  { name: 'December 2021 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2021-12-07', price: null, games: [
    "8Doors: Arum's Afterlife Adventure", 'Beyond The Wire', 'Endzone - A World Apart', 'Fling to the Finish',
    'Greak: Memories of Azur', 'Lacuna', 'Maneater', 'MORDHAU', 'Partisans 1941', 'The Survivalists', 'TOHU',
    'Voidigo'] },
  { name: 'Humble Dangerous Worlds Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-12-08', price: null, games: [
    'Among Us', 'Kingdom: New Lands + Kingdom: Classic', 'Generation Zero®', 'Kingdom Two Crowns', 'Lemnis Gate',
    'State of Decay 2', 'State of Decay 2 Soundtrack'] },
  { name: 'Focus Home Interactive Build Your Own Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-12-10', price: null, games: [
    'A Plague Tale: Innocence', 'Battlefleet Gothic: Armada 2',
    'Battlefleet Gothic: Armada 2 - Chaos Campaign Expansion', 'Battlefleet Gothic: Armada 2 - Soundtrack',
    'Call of Cthulhu', 'Faery - Legends of Avalon', 'Fear The Wolves', 'Final Exam', 'GreedFall',
    'GreedFall Gold Edition', 'Hood: Outlaws & Legends', 'Masters of Anima', 'MudRunner - American Wilds',
    'MudRunner American Wilds Edition', 'Necromunda: Underhive Wars', 'Necromunda: Underhive Wars - Gangs Bundle'] },
  { name: 'Microids: Games & Comics Crossover Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-12-10', price: null, games: [
    'Garfield Kart', 'Syberia', 'Syberia 2', 'Agatha Christie - The ABC Murders', 'Asterix & Obelix XXL 2',
    'Asterix & Obelix XXL 3  - The Crystal Menhir', 'XIII - Classic'] },
  { name: 'Humble GameMaker Studio 2 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-12-20', price: null, games: [
    'Post Void', 'Super Raft Boat Classic', 'Last Horizon', 'Space Gladiators', 'Cattails',
    'Cook, Serve, Delicious! 3?!', 'Crashlands', 'Ministry of Broadcast'] },
  { name: 'Ultimate Fishing Simulator - Complete Your Collection Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2021-12-22', price: null, games: [
    'Ultimate Fishing® Simulator', 'Ultimate Fishing® Simulator - Kariba Dam DLC',
    'Ultimate Fishing® Simulator - Moraine Lake DLC', 'Ultimate Fishing® Simulator - New Fish Species',
    'Ultimate Fishing® Simulator - Sakura Lures DLC', 'Ultimate Fishing® Simulator - Amazon River DLC',
    'Ultimate Fishing® Simulator - Greenland DLC', 'Ultimate Fishing® Simulator - Japan DLC',
    'Ultimate Fishing® Simulator - Thailand DLC', 'Ultimate Fishing® Simulator - VR DLC'] },
  { name: 'January 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-01-04', price: null, games: [
    'Between the Stars', "Farmer's Dynasty", 'Iron Harvest', 'Mafia: Definitive Edition', 'Midnight Protocol',
    'Project Winter', 'Rebel Cops', 'Retrowave', 'Rustler', 'The Henry Stickmin Collection'] },
  { name: 'Dead of Winter Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-01-07', price: null, games: [
    'Friday the 13th: The Game', 'Daymare: 1998', 'The Painscreek Killings', 'White Day VR: Courage Test',
    'White Day: A Labyrinth Named School', 'Dead Estate', 'Golden Light'] },
  { name: 'PC Building Simulator Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-01-12', price: null, games: [
    'PC Building Simulator', 'PC Building Simulator - Overclocked Edition Content',
    'PC Building Simulator - Razer Workshop', 'PC Building Simulator - Republic of Gamers Workshop',
    'PC Building Simulator - AORUS Workshop', 'PC Building Simulator - Esports Expansion',
    'PC Building Simulator - EVGA Workshop', 'PC Building Simulator - Fractal Design Workshop',
    'PC Building Simulator - NZXT Workshop', 'PC Building Simulator - Overclockers UK Workshop'] },
  { name: 'Surviving Mars Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-01-14', price: null, games: [
    'Surviving Mars', 'Surviving Mars - Stellaris Dome Set', 'Surviving Mars: Colony Design Set',
    'Surviving Mars: Mars Lifestyle Radio', 'Surviving Mars: Marsvision Song Contest', 'Surviving Mars: Project Laika',
    'Surviving Mars: Deluxe Edition Upgrade Pack', 'Surviving Mars: Green Planet',
    'Surviving Mars: In-Dome Buildings Pack', 'Surviving Mars: Space Race'] },
  { name: 'Brain Tickler Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-01-19', price: null, games: [
    'Heal', 'LUMINES REMASTERED', 'while True: learn()', 'while True: learn() Art Pack',
    'while True: learn() Mega Map of Machine Learning', 'while True: learn() Soundtrack', 'Mars Horizon',
    'Retro Machina', "The Signifier Director's Cut"] },
  { name: 'Indie Houses Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-01-21', price: null, games: [
    'Super Mutant Alien Assault', 'The Count Lucanor', 'Desert Child', 'Elden: Path of the Forgotten',
    'Hiveswap Friendsim Complete', 'We should talk.', 'Western Press', 'Beasts of Maravilla Island', 'Etherborn',
    'GONNER2', 'Jack Axe', 'Mosaic'] },
  { name: 'Myst & More Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-01-28', price: null, games: [
    'Cosmic Osmo', 'Myst: Masterpiece Edition', 'Spelunx', 'Manhole', 'Myst V', 'Riven (1997)',
    'Uru: Complete Chronicles', 'Myst III: Exile', 'Myst IV: Revelation', 'Obduction',
    'realMyst: Masterpiece Edition'] },
  { name: 'February 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-02-01', price: null, games: [
    'Before We Leave', 'Black Book', 'Borderlands 3', "Borderlands 3: Director's Cut", 'Calico', 'Everhood',
    'Just Die Already', 'Paradise Lost', 'Per Aspera'] },
  { name: 'F*CK CANCER Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-02-04', price: null, games: [
    'Brothers - A Tale of Two Sons', 'Dead by Daylight', 'Dungeon of the Endless (with Artbook depot)',
    "Hamilton's Great Adventure", 'Homeworld Remastered Collection', 'Homeworld: Deserts of Kharak',
    'Little Nightmares', 'Magicka', 'PAYDAY 2', 'PAYDAY 2: F*ck Cancer - Big Mike Mask', 'Red Faction: Armageddon',
    'theHunter: Call of the Wild', 'World War Z'] },
  { name: 'VR Discovery Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-02-18', price: null, games: [
    'Tower Tag', 'Blaston', 'Synth Riders', 'Cook-Out', 'Panoptic', 'Red Matter', 'Trover Saves the Universe'] },
  { name: 'Strategy BYOB 2022', store: 'Humble Bundle', kind: 'bundle', date: '2022-02-21', price: null, games: [
    'A Long Way Down', 'Age of Empires III: Definitive Edition', 'Age of Empires: Definitive Edition',
    'Ancestors Legacy', 'Ancestors Legacy - Digital Artbook', 'Ancestors Legacy - Digital Soundtrack',
    "Ancestors Legacy - Saladin's Conquest", 'Ancestors Legacy Bundle', 'Ancestors Legacy Complete Edition',
    'Armada 2526 Gold Edition', 'Army Men RTS', 'As Far As The Eye', 'Bad North - Deluxe Edition (retailer)',
    'Bad North: Jotunn Edition', 'Ceres', 'Dawn of Andromeda'] },
  { name: "Sid Meier's Ultimate Collection", store: 'Humble Bundle', kind: 'bundle',
    date: '2022-02-23', price: null, games: [
    "Sid Meier's Ace Patrol", "Sid Meier's Colonization (Classic)", "Sid Meier's Covert Action (Classic)",
    "Sid Meier's Ace Patrol: Pacific Skies", "Sid Meier's Civilization III: Complete", "Sid Meier's Railroads!",
    "Sid Meier's Starships", 'Civilization: Beyond Earth – The Collection',
    "Sid Meier's Civilization IV: The Complete Edition", "Sid Meier's Civilization V: Complete Edition",
    "Sid Meier's Pirates!", "Sid Meier's Civilization VI",
    "Sid Meier's Civilization® VI: Australia Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Gathering Storm",
    "Sid Meier's Civilization® VI: Khmer and Indonesia Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Nubia Civilization & Scenario Pack"] },
  { name: 'Overwhelmingly Positive Gems', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-02-25', price: null, games: [
    'Finding Paradise', 'Huntdown', 'There Is No Game: Wrong Dimension', 'Bang-On Balls: Chronicles',
    'Clone Drone in the Danger Zone', "Kathy Rain: Director's Cut", 'Shadow Man Remastered'] },
  { name: 'March 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-03-01', price: null, games: [
    'Desperados III', "Evan's Remains", 'Nebuchadnezzar', 'Nickelodeon All-Star Brawl', 'Police Stories',
    'Red Solstice 2: Survivors', 'The Dark Pictures Anthology: Man of Medan'] },
  { name: 'Humble Heroines', store: 'Humble Bundle', kind: 'bundle', date: '2022-03-02', price: null, games: [
    'Tacoma', 'Celeste', 'Cloudpunk', 'Gears 5', 'SCARLET NEXUS', 'Severed Steel'] },
  { name: 'Best of Boomer Shooters Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-03-04', price: null, games: [
    'Hellbound', 'Hedon Bloodrite', 'Project Warlock', 'AMID EVIL', 'Dread Templar', 'DUSK', 'HROT', 'Ion Fury'] },
  { name: 'The Ultimate Racing Sim Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-03-09', price: null, games: [
    'Automobilista', 'Assetto Corsa Ultimate Edition', 'NASCAR Heat 5', 'NASCAR Heat 5 - Ultimate Pass', 'rFactor 2',
    'Assetto Corsa Competizione', 'Automobilista 2', 'DRIFT CE'] },
  { name: 'The Complete Game Making Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-03-17', price: null, games: [
    'GameGuru - Cemetery Pack', 'GameGuru - Mega Pack 1', 'GameGuru - Walled Garden Pack', 'GameGuru Classic',
    'AppGameKit Classic', 'AppGameKit Classic - Giant Asset Pack 1', 'GameGuru - Buildings Pack',
    'GameGuru - Camping Pack', 'GameGuru - Death Valley Pack', 'GameGuru - Mega Pack 2', 'GameGuru - Tool Shed Pack',
    'AppGameKit - Visual Editor', 'AppGameKit Classic - 3D Asset Pack', 'AppGameKit Classic - Giant Asset Pack 2',
    'AppGameKit Classic - VR', 'AppGameKit Studio'] },
  { name: 'Stand With Ukraine Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-03-18', price: null, games: [
    '112 Operator', '911 Operator', 'Amnesia Collection', 'Amnesia: Rebirth', 'Back 4 Blood', 'Book of Demons',
    'Broken Age', 'Brothers - A Tale of Two Sons', 'Car Mechanic Simulator 2018', 'Corridor Z', 'Crying Suns',
    'Dagon - The Eldritch Box DLC', 'Dear Esther: Landmark Edition', 'Draw Slasher', 'Drawful 2',
    'Driftland: The Magic Revival'] },
  { name: 'Europa Universalis IV The Complete Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-03-23', price: null, games: [
    'Europa Universalis IV', 'Europa Universalis IV: Art of War', 'Europa Universalis IV: Conquest of Paradise',
    'Europa Universalis IV: Digital Extreme Edition Upgrade Pack', 'Europa Universalis IV: El Dorado',
    'Europa Universalis IV: El Dorado Content Pack', 'Europa Universalis IV: Res Publica',
    'Europa Universalis IV: Wealth of Nations', 'Europa Universalis IV: Common Sense',
    'Europa Universalis IV: Common Sense Content Pack', 'Europa Universalis IV: Mandate of Heaven',
    'Europa Universalis IV: Mandate of Heaven Content Pack', 'Europa Universalis IV: Mare Nostrum',
    'Europa Universalis IV: Mare Nostrum Content Pack', 'Europa Universalis IV: Rights of Man',
    'Europa Universalis IV: Rights of Man Content Pack'] },
  { name: 'Killing Floor Collection', store: 'Humble Bundle', kind: 'bundle', date: '2022-04-01', price: null, games: [
    'KF1 Bundle 2022 Tier 1', 'Killing Floor', 'KF1 Bundle 2022 Tier 2', 'Killing Floor 2',
    'Killing Floor 2 Digital Deluxe Edition', 'Killing Floor: Incursion', 'KF2 - Season Pass 2021',
    'KF2 Bundle 2022 Tier 3', 'KF2 Bundle 2022 Tier 4'] },
  { name: 'April 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-04-05', price: null, games: [
    'Chicken Police', 'Destroy All Humans!', 'Ghostrunner', 'Killsquad', 'Monster Sanctuary',
    'NARUTO TO BORUTO: SHINOBI STRIKER', 'Rogue Heroes: Ruins of Tasos', 'Suzerain'] },
  { name: 'Industrious Sims Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-04-06', price: null, games: [
    'Accident', 'Construction-Simulator (2015) Deluxe Edition', 'Gravel', 'BarnFinders', 'BarnFinders: Amerykan Dream',
    'Farming Simulator 17 - Platinum Edition', 'SimAirport', 'SimCasino', 'Wrench'] },
  { name: 'Game Night! By Asmodee', store: 'Humble Bundle', kind: 'bundle', date: '2022-04-08', price: null, games: [
    'Love Letter', 'Small World', 'Small World 2 - Grand Dames', 'Carcassonne: The Official Board Game',
    'Inns & Cathedrals - Expansion', 'Splendor', 'Splendor - The Cities', 'Splendor - The Strongholds',
    'Ticket to Ride', 'Ticket To Ride - France', 'Ticket to Ride - Legendary Asia', 'A Game of Thrones: The Board Game',
    "Arkham Horror: Mother's Embrace", 'Blood Rage: Digital Edition', 'Small World 2 - Be Not Afraid...',
    'Terraforming Mars'] },
  { name: 'Must-Play VR Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-04-13', price: null, games: [
    'Vanishing Realms', 'Down The Rabbit Hole', 'PowerBeatsVR', 'Propagation VR - Co-op', 'Traffic Jams', 'Pistol Whip',
    'Ragnarock', 'Vacation Simulator'] },
  { name: 'Dungeon Defenders Legendary Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-04-15', price: null, games: [
    'Dungeon Defenders', 'Dungeon Defenders Collection (Summer-Winter 2012)', 'Dungeon Defenders: Awakened',
    'Dungeon Defenders: Going Rogue'] },
  { name: 'The X Universe Collection', store: 'Humble Bundle', kind: 'bundle', date: '2022-04-20', price: null, games: [
    'X-Tension', 'X: Beyond the Frontier', 'X2: The Threat', 'X Rebirth', 'X Rebirth: The Teladi Outpost',
    'X3: Albion Prelude', 'X3: Terran Conflict', 'X4: Foundations', 'X4: Split Vendetta'] },
  { name: 'Visual Delight Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-04-22', price: null, games: [
    'Townscaper', 'El Hijo', 'Labyrinth City: Pierre the Maze Detective', "A Juggler's Tale", 'Rubber Bandits',
    'Space Crew: Legendary Edition', 'TOEM'] },
  { name: 'Jurassic Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-04-27', price: null, games: [
    'Jurassic World Evolution', 'Jurassic World Evolution - Deluxe DLC',
    'Jurassic World Evolution: Carnivore Dinosaur Pack', 'Jurassic World Evolution: Cretaceous Dinosaur Pack',
    'Jurassic World Evolution: Herbivore Dinosaur Pack', 'Jurassic World Evolution: Raptor Squad Skin Collection',
    "Jurassic World Evolution: Claire's Sanctuary", 'Jurassic World Evolution: Return To Jurassic Park',
    'Jurassic World Evolution: Secrets of Dr Wu'] },
  { name: 'May 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-05-03', price: null, games: [
    'Embr', 'Genesis Noir', 'If Found', 'Planet Zoo', 'Spellcaster University',
    'SpongeBob SquarePants: Battle for Bikini Bottom - Rehydrated', 'Surviving the Aftermath'] },
  { name: 'Game Over, T1D: Games with Links to the Diabetes Community', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-05-04', price: null, games: [
    "Bartlow's Dread Machine", 'Gauntlet Slayer Edition', 'Observation', 'Pine', 'RAD', 'Sam & Max Save the World',
    'Saturday Morning RPG', 'Stories Untold', 'Super Meat Boy', 'Super Meat Boy Forever',
    'The Walking Dead: Saints & Sinners', 'We Happy Few'] },
  { name: 'Kalypso Hits', store: 'Humble Bundle', kind: 'bundle', date: '2022-05-06', price: null, games: [
    'Commandos: Behind Enemy Lines', 'Dungeons', 'Dungeons 2', 'Sudden Strike 4', 'Commandos 2 - HD Remaster',
    'Dungeons 3', 'Tropico 5', 'Railway Empire', 'Spacebase Startopia', 'Tropico 6'] },
  { name: 'Handheld PC Power Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-05-11', price: null, games: [
    'Exanima', 'Orcs Must Die 2 - Complete Pack', 'Orcs Must Die! 2', 'Paint the Town Red', 'Parkasaurus',
    'MechWarrior 5: Mercenaries', 'Mutant Year Zero: Road to Eden - Deluxe Edition', 'Neon Abyss',
    'Neon Abyss - Alter Ego', 'Neon Abyss - Chrono Trap', 'Neon Abyss Soundtrack', 'Orcs Must Die! 3',
    'The Lovable Rogues Pack'] },
  { name: 'Battles of Yore Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-05-18', price: null, games: [
    'CROSSBOW: Bloodnight', 'Tyranny - Deluxe Edition', 'Ember', 'Plebby Quest: The Crusades',
    'Field of Glory: Empires', 'Gordian Quest', 'Pathfinder: Kingmaker - Royal Ascension DLC',
    'Pathfinder: Kingmaker — Enhanced Plus Edition', 'Pathfinder: Kingmaker — The Wildcards'] },
  { name: 'Springtide Indies Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-05-20', price: null, games: [
    'Dungeon Rushers', 'Impulsion', 'Out of Space', 'Sigma Theory', 'Tiny Lands', 'Arietta of Spirits',
    'As Far As The Eye', 'Paper Beast - Folded Edition', 'Recompile'] },
  { name: 'Cities Skylines Colossal Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-05-25', price: null, games: [
    'Cities: Skylines', 'Cities: Skylines - After Dark', 'Cities: Skylines - Content Creator Pack: Art Deco',
    'Cities: Skylines - Deluxe Pack', 'Cities: Skylines - Snowfall', 'Cities: Skylines - All That Jazz',
    'Cities: Skylines - Concerts', 'Cities: Skylines - Content Creator Pack: European Suburbia',
    'Cities: Skylines - Content Creator Pack: High-Tech Buildings', 'Cities: Skylines - Green Cities',
    'Cities: Skylines - Mass Transit', 'Cities: Skylines - Natural Disasters', 'Cities: Skylines - Relaxation Station',
    'Cities: Skylines - Rock City Radio', 'Cities: Skylines - Campus', 'Cities: Skylines - Campus Radio'] },
  { name: 'June 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-06-07', price: null, games: [
    'Call of the Sea', 'Gamedec - Definitive Edition', 'I Am Fish', 'Phoenix Point', 'Pumpkin Jack',
    'Siege Survival: Gloria Victis', 'SUPERHOT: MIND CONTROL DELETE'] },
  { name: 'Capcom Summer 2022 Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-06-08', price: null, games: [
    'Bionic Commando', 'Strider', 'DmC Devil May Cry', "Dragon's Dogma: Dark Arisen", 'Street Fighter V',
    'Ultra Street Fighter IV', 'Devil May Cry 5 + Vergil', 'Devil May Cry HD Collection', 'Monster Hunter: World'] },
  { name: 'Talisman The Complete Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-06-22', price: null, games: [
    'Talisman: Digital Classic Edition', 'Character Pack #1 - Exorcist', 'Character Pack #10 - Shaman',
    'Character Pack #11 - Illusionist', 'Character Pack #12 - Jester', 'Character Pack #13 - Goblin Shaman',
    'Character Pack #14 - Martial Artist', 'Character Pack #15 - Saracen', 'Character Pack #2 - Courtesan',
    "Character Pack #3 - Devil's Minion", 'Character Pack #4 - Genie', 'Character Pack #5 - Martyr',
    'Character Pack #6 - Gambler', 'Character Pack #7 - Black Witch', 'Character Pack #8 - Apprentice Mage',
    'Character Pack #9 - Shape Shifter'] },
  { name: 'RPG Maker Resurgence Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-06-30', price: null, games: [
    'RPG Maker VX Ace', 'RPG Maker VX Ace - Dark Hero Character Pack', 'RPG Maker VX',
    'RPG Maker VX Ace - Fantastic Buildings: Modern', 'RPG Maker VX Ace - Time Fantasy',
    'RPG Maker VX Ace - Wild West Tiles Pack', 'RPG Maker VX Ace - Wonderland Music Pack', 'RPG Maker MV',
    'RPG Maker MV - Ancient Dungeons: Base Pack', 'RPG Maker MV - Animations Collection I: Quintessence',
    'RPG Maker MV - DS Resource Pack', 'RPG Maker MV - Fantasy Heroine Character Pack',
    'RPG Maker MV - Heroine Character Generator', 'RPG Maker MV - Modern Music Mega-Pack',
    'RPG Maker MV - Paranormal Monsters', 'RPG Maker MV - POP! Horror City'] },
  { name: 'July 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-07-05', price: null, games: [
    'ATOM RPG Trudograd', 'Banners of Ruin', 'Deep Rock Galactic', 'Lawn Mowing Simulator', 'Legend of Keepers',
    'Legion TD 2', 'Necromunda: Hired Gun', 'Yes, Your Grace'] },
  { name: 'Play With Pride', store: 'Humble Bundle', kind: 'bundle', date: '2022-07-06', price: null, games: [
    "Kitty Powers' Matchmaker", '2064: Read Only Memories', 'Monster Prom: First Crush Bundle', 'Coffee Talk',
    'Lost Ember', 'Monster Prom 2: Monster Camp'] },
  { name: 'Lego at the Movies Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-07-08', price: null, games: [
    'LEGO MARVEL Super Heroes', 'The LEGO Movie - Videogame', "LEGO® MARVEL's Avengers", 'LEGO Jurassic World',
    'LEGO MARVEL Super Heroes 2', 'LEGO DC Super-Villains', 'LEGO The Incredibles', 'The LEGO Movie 2 - Videogame',
    'The LEGO NINJAGO Movie Video Game'] },
  { name: 'Focus Entertainment: Legends and Visions Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-07-13', price: null, games: [
    'The Technomancer', 'Bound By Flame', 'The Surge', 'MudRunner', 'The Surge 2', 'Hood: Outlaws & Legends',
    'Vampyr'] },
  { name: "Outright Games' Summer Break", store: 'Humble Bundle', kind: 'bundle',
    date: '2022-07-15', price: null, games: [
    'Crayola Scoot', 'Adventure Time: Pirates of the Enchiridion', 'Ben 10', 'DreamWorks Dragons: Dawn of New Riders',
    'TRANSFORMERS: BATTLEGROUNDS', 'Ben 10: Power Trip', 'Jumanji: The Video Game', 'My Friend Peppa Pig',
    'PAW Patrol Mighty Pups  Save Adventure Bay', 'Paw Patrol: On A Roll'] },
  { name: 'Railway Empire Complete Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-07-20', price: null, games: [
    'Railway Empire', 'Railway Empire - Crossing the Andes', 'Railway Empire - Mexico',
    'Railway Empire - The Great Lakes', 'Railway Empire - Down Under', 'Railway Empire - France',
    'Railway Empire - Great Britain & Ireland', 'Railway Empire - Germany', 'Railway Empire - Japan',
    'Railway Empire - Northern Europe'] },
  { name: 'Deck Builder Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-07-22', price: null, games: [
    'Cultist Simulator', 'Cultist Simulator: Original Soundtrack', 'Cultist Simulator: The Dancer',
    'Cultist Simulator: The Exile', 'Cultist Simulator: The Ghoul', 'Cultist Simulator: The Priest',
    'One Step From Eden', 'Vault of the Void', 'Black Book', 'Library Of Ruina', 'Wingspan'] },
  { name: 'Summer Sims Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-07-27', price: null, games: [
    'Fireworks Simulator', 'Construction-Simulator (2015) Deluxe Edition', 'Drone Swarm',
    'Take Off - The Flight Simulator', 'TransOcean: The Shipping Company', 'Bus Simulator 18',
    'Bus Simulator 18 - MAN Bus Pack 1', 'Bus Simulator 18 - MAN Interior Pack 1',
    'Bus Simulator 18 - Mercedes-Benz Bus Pack 1', 'Bus Simulator 18 - Mercedes-Benz Interior Pack 1',
    'Bus Simulator 18 - Official map extension', 'Bus Simulator 18 - Setra Bus Pack 1',
    'Firefighting Simulator - The Squad'] },
  { name: 'Amazing Adventures Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-07-29', price: null, games: [
    'The Almost Gone', 'Draugen', 'Dreamfall Chapters', 'Quern - Undying Thoughts', 'Unavowed',
    'Agatha Christie - Hercule Poirot: The First Cases', 'Alfred Hitchcock - Vertigo', 'Beyond a Steel Sky'] },
  { name: 'August 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-08-02', price: null, games: [
    'A Plague Tale: Innocence', 'Emily is Away <3', 'Gas Station Simulator', 'HOT WHEELS UNLEASHED™', 'In Sound Mind',
    'Mind Scanners', 'Omno', 'The Ascent'] },
  { name: 'The Walking Dead 10th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-08-03', price: null, games: [
    'The Walking Dead', 'The Walking Dead: 400 Days', 'The Walking Dead: Season Two',
    'The Walking Dead: A New Frontier', 'The Walking Dead: Michonne', 'The Walking Dead: The Final Season',
    'The Walking Dead: Saints & Sinners', 'The Walking Dead: The Telltale Definitive Series'] },
  { name: 'Final Frontier Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-08-05', price: null, games: [
    'Defy Gravity', 'Deep Space Battle Simulator', 'EVERSPACE', 'EVERSPACE - Encounters',
    'EVERSPACE™ - Soundtrack, Artbook, and Wallpapers', 'Starpoint Gemini Warlords Gold Pack',
    'Battlestar Galactica Deadlock', 'Battlestar Galactica Deadlock: Anabasis',
    'Battlestar Galactica Deadlock: Reinforcement Pack', 'Battlestar Galactica Deadlock: Sin & Sacrifice',
    'Battlestar Galactica Deadlock: The Broken Alliance', 'Godlike Burger', 'Per Aspera'] },
  { name: 'Resident Evil Decades of Horror Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-08-10', price: null, games: [
    'Resident Evil', 'Resident Evil Revelations', 'Resident Evil Revelations 2', 'Resident Evil 0',
    'Resident Evil 5 Gold Edition', 'Resident Evil 6',
    'Resident Evil Revelations 2 / Biohazard Revelations 2 Deluxe Edition', 'Resident Evil 2', 'Resident Evil 3',
    'Resident Evil 4 (2005)', 'Resident Evil 7 Biohazard'] },
  { name: 'Tactical Combat Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-08-12', price: null, games: [
    'Verdun', 'Brigador: Up-Armored Deluxe', 'Call to Arms - Basic Edition package', 'Intruder', 'Perfect Heist 2',
    'Sniper Elite V2 Remastered', 'Call to Arms - Gates of Hell: Ostfront', 'Sniper Elite 4 Deluxe Edition'] },
  { name: 'Storied Strategy and Role-Playing Bundle (Paradox Turn-Based Bundle)', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-08-17', price: null, games: [
    'Age of Wonders: Planetfall Premium Edition', 'BATTLETECH - Shadow Hawk Pack', 'BATTLETECH Mercenary Collection',
    'Knights of Pen and Paper - Haunted Fall', 'Knights of Pen and Paper 2 - Here Be Dragons',
    'Knights of Pen and Paper I & II Collection', 'Pillars of Eternity - Definitive Edition',
    'Shadowrun Triple Pack'] },
  { name: 'Valiant VR Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-08-19', price: null, games: [
    'Budget Cuts 2: Mission Insolvency', 'Contractors VR', 'Dragon Fist: VR Kung Fu', 'Hard Bullet',
    'Into the Radius VR', 'Takelings House Party', 'VTOL VR'] },
  { name: 'Career Break Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-08-24', price: null, games: [
    'Little Big Workshop', 'Not Tonight', 'Airport CEO', 'Model Builder: Complete Edition', 'Project Hospital',
    'Dinosaur Fossil Hunter', 'Parkitect'] },
  { name: 'Fantastic Journeys: Middle-earth And Beyond', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-08-26', price: null, games: [
    'LEGO Harry Potter: Years 1-4', 'LEGO The Hobbit', 'LEGO Harry Potter: Years 5-7',
    'LEGO The Hobbit DLC 1 - The Big Little Character Pack', 'LEGO The Hobbit DLC 2 - Side Quest Character Pack',
    'LEGO The Hobbit DLC 3 - The Battle Pack', 'Gauntlet - Necromancer', 'Gauntlet Slayer Edition',
    'LEGO The Lord of the Rings', 'Middle-earth: Shadow of Mordor Game of the Year Edition',
    'Middle-earth: Shadow of War Definitive Edition'] },
  { name: 'Dungeons: The Complete Trilogy Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-08-31', price: null, games: [
    'Dungeons', 'Dungeons - Into the Dark', 'Dungeons - Map Pack', 'Dungeons - The Dark Lord', 'Dungeons 2',
    'Dungeons 2 - A Chance of Dragons', 'Dungeons 2 - A Game of Winter', 'Dungeons 2 - A Song of Sand and Fire',
    'Dungeons 3', 'Dungeons 3 - A Multitude of Maps', 'Dungeons 3 - An Unexpected DLC', 'Dungeons 3 - Clash of Gods',
    'Dungeons 3 - Evil of the Caribbean', 'Dungeons 3 - Famous Last Words', 'Dungeons 3 - Lord of the Kings',
    'Dungeons 3 - Once Upon A Time'] },
  { name: 'Level Up and Learn: Programming Games Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-09-02', price: null, games: [
    '7 Billion Humans', 'EXAPUNKS', 'Human Resource Machine', 'Learning Factory', 'SHENZHEN I/O', 'TIS-100',
    'while True: learn()'] },
  { name: 'September 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-09-06', price: null, games: [
    'Crown Trick', 'Crusader Kings III', 'Descenders', 'Forgive Me Father', 'INDUSTRIA',
    'Just Cause 4 Complete Edition', 'shapez', 'shapez - Puzzle DLC',
    'The Dungeon Of Naheulbeuk: The Amulet Of Chaos'] },
  { name: '2K Megahits Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-09-07', price: null, games: [
    'Army Men RTS', 'Hidden & Dangerous 2: Courage Under Fire', 'Hidden & Dangerous: Action Pack',
    'X-COM: Complete Pack', 'CivCity: Rome', 'Duke Nukem Forever', 'Duke Nukem Forever: Hail to the Icons Parody Pack',
    'Railroad Tycoon 2: Platinum', 'Railroad Tycoon 3', "Sid Meier's Railroads!", 'The Doctor Who Cloned Me',
    'The Golf Club 2019 Featuring PGA TOUR', 'WWE 2K BATTLEGROUNDS', 'WWE 2K BATTLEGROUNDS - Ultimate Brawlers Pass',
    'BioShock: The Collection', 'Borderlands 3: Super Deluxe Edition'] },
  { name: "Starlight Children's Foundation Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2022-09-09', price: null, games: [
    'Aliens vs. Predator Collection', 'Full Throttle Remastered', 'STAR WARS Jedi Knight: Jedi Academy',
    'STAR WARS™ Knights of the Old Republic™', 'Aliens Colonial Marines Collection', 'Day of the Tentacle Remastered',
    'Grim Fandango Remastered', 'LEGO STAR WARS: The Force Awakens', 'STAR WARS Jedi Knight II: Jedi Outcast',
    'STAR WARS Knights of the Old Republic II: The Sith Lords', 'LEGO Star Wars III: The Clone Wars',
    'LEGO Star Wars: The Complete Saga', 'Pinball FX3 - Marvel Pinball Avengers Chronicles',
    'Pinball FX3 - Marvel Pinball Original Pack', 'Pinball FX3 - Marvel Pinball Vengeance and Virtue Pack',
    'Pinball FX3 - Marvel Pinball: Cinematic Pack'] },
  { name: 'TinyBuild X Versus Evil Smashup Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-09-14', price: null, games: [
    'Guts and Glory', 'Hello Neighbor', 'Let Them Come', 'Cardpocalypse', 'HitchHiker', 'Wintermoor Tactics Club',
    'Mayhem in Single Valley', 'Pillars of Eternity II: Deadfire', 'The Hand of Merlin',
    'Totally Reliable Delivery Service'] },
  { name: 'Total War Classics Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-09-16', price: null, games: [
    'Viking: Battle for Asgard', 'MEDIEVAL: Total War - Gold Edition', 'SHOGUN: Total War™ - Collection',
    'Total War: EMPIRE - Definitive Edition', 'Total War: NAPOLEON - Definitive Edition',
    'Total War: MEDIEVAL II - Definitive Edition', 'Total War: SHOGUN 2',
    'Total War: SHOGUN 2 - Rise of the Samurai Campaign DLC'] },
  { name: 'Serious Sam Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-09-21', price: null, games: [
    'Serious Sam Classics: Revolution', 'Serious Sam Double D XXL', 'Serious Sam: Kamikaze Attack!',
    'Serious Sam: The Random Encounter', 'I Hate Running Backwards', 'Serious Sam 2', 'Serious Sam 3 BFE Gold',
    'Serious Sam HD: Double Pack', 'Serious Sam HD: The Second Encounter - Legend of the Beast DLC',
    'Serious Sam HD: The Second Encounter Player Models', "Serious Sam's Bogus Detour", 'Serious Sam 4',
    'Serious Sam: Siberian Mayhem', 'Serious Sam: Tormental'] },
  { name: 'Content Creators Image & Video Tools Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-09-26', price: null, games: [
    'Movavi Slideshow Maker 8', 'Movavi Slideshow Maker 8 - Education Set', 'Movavi Slideshow Maker 8 - Travel Set',
    'Gecata by Movavi 5 - Game Recording Software', 'Movavi Photo Editor', 'Movavi Video Converter Premium 2020',
    'Movavi Video Editor Plus 2020', 'Movavi Video Editor Plus 2020 - Cinematic Set',
    'Movavi Video Editor Plus 2020 - Halloween Pack', 'Movavi Video Editor Plus 2020 - Mystical Galaxy Pack',
    'Movavi Video Editor Plus 2020 - Pixel Age Pack', 'Movavi Video Editor Plus 2020 - Technology Set'] },
  { name: 'October 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-10-04', price: null, games: [
    'DEATHLOOP', 'Disciples: Liberation', 'Epic Chef', 'Golf Gang', 'Maid of Sker', 'Monster Train',
    'Monster Train: The Last Divinity', 'Railroad Corporation', 'The Dark Pictures Anthology: Little Hope'] },
  { name: "RPG Legends: Baldur's Gate & Beyond Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2022-10-05', price: null, games: [
    'Icewind Dale: Enhanced Edition', 'Planescape: Torment: Enhanced Edition', "Baldur's Gate II: Enhanced Edition",
    "Baldur's Gate: Enhanced Edition", "Baldur's Gate: Faces of Good and Evil", "Baldur's Gate: Siege of Dragonspear",
    'Neverwinter Nights: Enhanced Edition', 'Neverwinter Nights: Enhanced Edition Dark Dreams of Furiae',
    'Neverwinter Nights: Enhanced Edition Darkness Over Daggerford',
    'Neverwinter Nights: Enhanced Edition Infinite Dungeons',
    'Neverwinter Nights: Enhanced Edition Pirates of the Sword Coast',
    'Neverwinter Nights: Enhanced Edition Tyrants of the Moonsea',
    'Neverwinter Nights: Enhanced Edition Wyvern Crown of Cormyr',
    'Pathfinder: Wrath of the Righteous - Enhanced Edition'] },
  { name: 'Warhammer Vermintide Franchise Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-10-07', price: null, games: [
    'Warhammer: End Times - Vermintide', "Warhammer: End Times - Vermintide Collector's Edition",
    "Warhammer Vermintide - Bardin 'Studded Leather' Skin", "Warhammer Vermintide - Kerillian 'Tirsyth Garment' Skin",
    "Warhammer Vermintide - Kruber 'Carroburg Livery' Skin",
    "Warhammer Vermintide - Saltzpyre ' Estalian Leather Coat' Skin", "Warhammer Vermintide - Sienna 'Wyrmscales' Skin",
    'Warhammer: End Times - Vermintide Death on the Reik', 'Warhammer: End Times - Vermintide Drachenfels',
    'Warhammer: End Times - Vermintide Karak Azgaraz', 'Warhammer: End Times - Vermintide Schluesselschloss',
    'Warhammer: End Times - Vermintide Stromdorf', 'Warhammer: Vermintide 2',
    "Warhammer: Vermintide 2 - Collector's Edition", 'Warhammer: Vermintide 2 - Grail Knight Career',
    'Warhammer: Vermintide 2 - Shadows Over Bögenhafen'] },
  { name: 'Melee Mayhem Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-10-12', price: null, games: [
    'Chronicon', 'MORDHAU', 'Mortal Kombat 11', 'Nickelodeon All-Star Brawl', 'River City Girls', 'Song of Iron',
    'Chivalry 2'] },
  { name: 'Day of the Devs 2022 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-10-14', price: null, games: [
    '140', 'Brütal Legend', 'Broken Age', 'Broken Age - Soundtrack', 'Double Fine Adventure', 'Escape Goat 2',
    'Everything', 'Gang Beasts', 'GNOG', 'MASSIVE CHALICE', 'Psychonauts', 'Psychonauts in the Rhombus of Ruin',
    'Spacebase DF-9', 'THOTH'] },
  { name: 'Payday 2: The Ultimate Score Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-10-19', price: null, games: [
    'PAYDAY 2', 'PAYDAY 2: Sydney Mega Mask', 'PAYDAY 2: Legacy Collection (Koch Tier 1)',
    'PAYDAY 2: Silk Road Collection (Koch Tier 1)', 'PAYDAY 2: City of Gold Collection (Koch Tier 1)'] },
  { name: 'World of Darkness Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-10-21', price: null, games: [
    'Vampire: The Masquerade - Coteries of New York', 'Vampire: The Masquerade - Shadows of New York',
    'Vampire: The Masquerade — Night Road', 'Werewolf: The Apocalypse - Heart of the Forest',
    'Vampire: The Masquerade — Out for Blood', 'Vampire: The Masquerade — Parliament of Knives',
    'Vampire: The Masquerade — Sins of the Sires', 'Wraith: The Oblivion - Afterlife'] },
  { name: 'Train Simulator: All Aboard! Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-10-28', price: null, games: [
    'Train Simulator Classic 2022 Store & Humble Bundle package', 'Train Simulator: Class 170 ‘Turbostar’ DMU Add-On',
    'Train Simulator: DB BR 648 Loco Add-On', "Train Simulator: Grand Central Class 180 'Adelante' DMU Add-On",
    'Train Simulator: Peninsula Corridor: San Francisco - Gilroy Route Add-On',
    'Train Simulator: Thompson Class B1 Add-On', 'Train Simulator: Amtrak E8 Loco Add-On',
    'Train Simulator: DB BR 605 ICE TD Add-On',
    'Train Simulator: Fife Circle Line: Edinburgh - Dunfermline Route Add-On',
    'Train Simulator: Mittenwaldbahn: Garmisch-Partenkirchen - Innsbruck Route Add-On',
    'Train Simulator: Amtrak P42 DC Empire Builder', 'Train Simulator: BR Regional Railways Class 101',
    'Train Simulator: Chatham Main Line Route Add-On', 'Train Simulator: DB BR 407 ‘New ICE 3’ EMU Add-On',
    'Train Simulator: Hamburg Hanover Route', 'Train Simulator: Hudson Line: New York – Croton-Harmon Route Add-On'] },
  { name: 'November 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-11-01', price: null, games: [
    'Eldest Souls', 'Hell Let Loose', 'Kingdoms of Amalur: Re-Reckoning FATE Edition', 'Morbid: The Seven Acolytes',
    'Raji: An Ancient Epic', 'Roboquest', "Shadow Tactics: Blades of the Shogun - Aiko's Choice", 'UnMetal'] },
  { name: 'The Complete 11 bit Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-11-04', price: null, games: [
    'Anomaly Über Bundle', 'SPACECOM', 'Beat Cop', 'This War of Mine: Complete Edition', 'Tower 57',
    'Children of Morta: Complete Edition', 'Frostpunk', 'Frostpunk: Season Pass', 'Moonlighter',
    'Moonlighter - Between Dimensions DLC', 'South of the Circle'] },
  { name: 'Complete Your Twin Sails Collection: 7 Tabletop Classics', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-11-11', price: null, games: [
    'Blood Rage: Digital Edition', 'Carcassonne: The Official Board Game', 'Mysterium', 'Small World', 'Splendor',
    'Ticket to Ride', 'Blood Rage: Digital Edition - Gods of Asgard',
    'Blood Rage: Digital Edition - Mystics of Midgard', 'Blood Rage: Digital Edition - Mythical Monsters',
    'Carcassonne - The Princess & the Dragon Expansion', 'Carcassonne - Traders & Builders',
    'Inns & Cathedrals - Expansion', 'Mysterium - Hidden Signs', 'Mysterium - Secrets and Lies',
    "Small World - A Spider's Web", 'Small World 2 - Be Not Afraid...'] },
  { name: "Black Friday VR Voyager's Pack", store: 'Humble Bundle', kind: 'bundle',
    date: '2022-11-18', price: null, games: [
    "A Fisherman's Tale", 'Acron: Attack of the Squirrels!', 'Car Mechanic Simulator VR', 'Cook-Out',
    'I Expect You To Die', 'Sairento VR', 'Shooty Fruity', 'SUPERHOT VR', 'The Curious Tale of the Stolen Pets',
    'The Wizards - Dark Times', 'Until You Fall'] },
  { name: 'Premier VR Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2022-12-02', price: null, games: [
    'Arizona Sunshine', 'Bean Stalker', 'Cave Digger 2: Dig Harder', 'DOOM VFR', 'After The Fall', 'Cosmonious High',
    'Vox Machinae'] },
  { name: 'December 2022 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2022-12-06', price: null, games: [
    'Blade Assault', 'First Class Trouble', 'GreedFall', 'Super Magbot', 'Tails Noir', 'TOEM', 'Wasteland 3',
    'Where the Water Tastes Like Wine'] },
  { name: 'Company Of Heroes Complete Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-08', price: null, games: [
    'Company of Heroes', 'Company of Heroes: Opposing Fronts', 'COH2 - The Western Front Armies: US Forces',
    'Company of Heroes 2', 'Company of Heroes 2 - Ardennes Assault: Fox Company Rangers',
    'Company of Heroes 2 - Case Blue Mission Pack', 'Company of Heroes 2 - The British Forces',
    'Company of Heroes 2 - Victory at Stalingrad Mission Pack', 'Company of Heroes Franchise Edition',
    'Company of Heroes: Tales of Valor', 'COH2 - The Western Front Armies: Oberkommando West',
    'Company of Heroes 2 - Ardennes Assault', 'Company of Heroes 2 - British Commander: Special Weapons Regiment',
    'Company of Heroes 2 - British Commander: Tactical Support Regiment',
    'Company of Heroes 2 - British Commander: Vanguard Operations Regiment',
    'Company of Heroes 2 - Faceplates Collection'] },
  { name: "The Tactician's Bundle", store: 'Humble Bundle', kind: 'bundle', date: '2022-12-09', price: null, games: [
    'Hard West', 'Phantom Doctrine', 'Warhammer 40,000: Mechanicus', 'Dark Deity', 'Gears Tactics', 'John Wick Hex',
    'Red Solstice 2: Survivors', 'Star Renegades'] },
  { name: '2K Megahits - Holiday Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-12', price: null, games: [
    'Army Men RTS', 'BioShock: The Collection', 'Borderlands 3: Super Deluxe Edition', 'CivCity: Rome',
    'Duke Nukem Forever', 'Duke Nukem Forever: Hail to the Icons Parody Pack',
    'Hidden & Dangerous 2: Courage Under Fire', 'Hidden & Dangerous: Action Pack', 'Mafia: Definitive Edition',
    'Railroad Tycoon 2: Platinum', 'Railroad Tycoon 3', "Sid Meier's Civilization VI", "Sid Meier's Railroads!",
    'The Doctor Who Cloned Me', 'WWE 2K BATTLEGROUNDS', 'WWE 2K BATTLEGROUNDS - Ultimate Brawlers Pass'] },
  { name: 'The Ultimate Racing Sim Bundle - Holiday Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-13', price: null, games: [
    'Assetto Corsa Competizione', 'Assetto Corsa Ultimate Edition', 'Automobilista', 'Automobilista 2', 'DRIFT CE',
    'NASCAR Heat 5', 'NASCAR Heat 5 - Ultimate Pass', 'rFactor 2'] },
  { name: "Sid Meier's Ultimate Collection - Holiday Encore", store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-14', price: null, games: [
    'Civilization: Beyond Earth – The Collection', "Sid Meier's Civilization IV: The Complete Edition",
    "Sid Meier's Civilization V: Complete Edition", "Sid Meier's Ace Patrol", "Sid Meier's Ace Patrol: Pacific Skies",
    "Sid Meier's Civilization III: Complete", "Sid Meier's Civilization VI",
    "Sid Meier's Civilization® VI: Australia Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Gathering Storm",
    "Sid Meier's Civilization® VI: Khmer and Indonesia Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Nubia Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Persia and Macedon Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Poland Civilization & Scenario Pack", "Sid Meier's Civilization® VI: Rise and Fall",
    "Sid Meier's Civilization® VI: Vikings Scenario Pack", "Sid Meier's Colonization (Classic)"] },
  { name: 'Best of Stealth - Holiday Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-15', price: null, games: [
    'Aragami', 'ECHO', 'Ghost of a Tale', 'Heat Signature', 'HITMAN: Game of the Year Edition',
    'HITMAN 2 - Gold Edition', 'Styx: Shards of Darkness'] },
  { name: 'Idle Champions: Gear Up for D&D Adventure!', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-16', price: null, games: [
    'Idle Champions - Bruenor Starter Pack', 'Idle Champions - Celeste Starter Pack',
    'Idle Champions - Delina Starter Pack', 'Idle Champions - Force Grey Arkhan Starter Pack',
    'Idle Champions - Force Grey Calliope Starter Pack', 'Idle Champions - Force Grey Jamilah Starter Pack',
    'Idle Champions - Jarlaxle Starter Pack', 'Idle Champions - Minsc & Boo Starter Pack',
    'Idle Champions - Asharra Starter Pack', 'Idle Champions - Force Grey Hitch Starter Pack',
    'Idle Champions - Force Grey Tyril Starter Pack', 'Idle Champions - Makos Starter Pack',
    'Idle Champions - Nayeli Starter Pack', 'Idle Champions - Red the Squirrel Familiar Pack'] },
  { name: 'LEGO: At the Movies - Holiday Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-16', price: null, games: [
    "LEGO® MARVEL's Avengers", 'LEGO DC Super-Villains', 'LEGO Jurassic World', 'LEGO MARVEL Super Heroes',
    'LEGO MARVEL Super Heroes 2', 'LEGO The Incredibles', 'The LEGO Movie - Videogame', 'The LEGO Movie 2 - Videogame',
    'The LEGO NINJAGO Movie Video Game'] },
  { name: 'Fantastic Journeys: Middle-earth and Beyond - Holiday Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-17', price: null, games: [
    'Gauntlet - Necromancer', 'Gauntlet Slayer Edition', 'LEGO Harry Potter: Years 1-4', 'LEGO Harry Potter: Years 5-7',
    'LEGO The Hobbit', 'LEGO The Hobbit DLC 1 - The Big Little Character Pack',
    'LEGO The Hobbit DLC 2 - Side Quest Character Pack', 'LEGO The Hobbit DLC 3 - The Battle Pack',
    'LEGO The Lord of the Rings', 'Middle-earth: Shadow of Mordor Game of the Year Edition',
    'Middle-earth: Shadow of War Definitive Edition'] },
  { name: 'Best of Boomer Shooters - Holiday Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-18', price: null, games: [
    'AMID EVIL', 'Dread Templar', 'DUSK', 'Hedon Bloodrite', 'Hellbound', 'Project Warlock'] },
  { name: 'Level Up and Learn: Communication and Meditation', store: 'Humble Bundle', kind: 'bundle',
    date: '2022-12-30', price: null, games: [
    'Epistory - Typing Chronicles', 'Influent', 'Learn Japanese To Survive - Hiragana Battle',
    'Learn Japanese To Survive! Kanji Combat', 'Learn Japanese To Survive! Katakana War',
    'Nanotale - Typing Chronicles', 'PLAYNE', 'Terra Alia', 'The Textorcist: The Story of Ray Bibbia',
    'You Can Kana'] },
  { name: 'January 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-01-03', price: null, games: [
    'Conan Chop Chop', 'DOOM Eternal', 'Encased', 'Grow: Song of the Evertree', 'Hokko Life',
    'OlliOlli World Rad Edition', 'The Serpent Rogue', 'Tribes of Midgard'] },
  { name: 'Wadjet Eye: Sixteen Years of Adventure!', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-01-11', price: null, games: [
    'Blackwell Convergence', 'Blackwell Deception', 'Blackwell Epiphany', 'Blackwell Unbound', 'Gemini Rue',
    'Primordia', 'Resonance', 'Shardlight', 'Strangeland', 'Technobabylon', 'The Blackwell Legacy', 'The Shivah',
    'Unavowed'] },
  { name: 'Fighting Farmers', store: 'Humble Bundle', kind: 'bundle', date: '2023-01-18', price: null, games: [
    'Forager', 'Kitaria Fables', 'Serin Fate', 'Stranded Sails - Explorers of the Cursed Islands', "Len's Island",
    'Re:Legend', 'Spirit Of The Island'] },
  { name: 'In Case You Missed It: Gems of 2022', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-01-20', price: null, games: [
    'Haiku, the Robot', 'PowerSlave Exhumed', 'Source of Madness', 'Supraland Six Inches Under',
    'Submerged: Hidden Depths', 'ZERO Sievert', 'Prehistoric Kingdom'] },
  { name: 'Survival Instinct Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2023-01-27', price: null, games: [
    'Chernobylite Complete Edition', 'SCUM', 'Starsand', 'State of Decay 2', 'SurrounDead',
    'The Long Dark: Survival Edition', 'Volcanoids'] },
  { name: 'The Complete Game Making Collection V2', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-01-28', price: null, games: [
    'AppGameKit Classic', 'AppGameKit Classic - Giant Asset Pack 1', 'AppGameKit Classic - Giant Asset Pack 2',
    'GameGuru - Buildings Pack', 'GameGuru - Medical Pack', 'GameGuru - Mega Pack 1', 'GameGuru - Mega Pack 2',
    'GameGuru - Mega Pack 3', 'GameGuru Classic', 'AppGameKit - Visual Editor', 'AppGameKit Classic - VR',
    'AppGameKit Studio', 'AppGameKit Studio - Particle Editor', 'AppGameKit Studio MEGA Media Pack',
    'GameGuru - Abandoned Apartment Pack', 'GameGuru - Antiques In The Attic Pack'] },
  { name: 'Celebrating Black Creators and Characters Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-02-01', price: null, games: [
    'An Airport for Aliens Currently Run by Dogs', 'Jay and Silent Bob: Mall Brawl', 'Mafia III: Definitive Edition',
    'Marlow Briggs', 'Semblance', 'Shadow Man Remastered', 'Shaq Fu: A Legend Reborn', 'Swimsanity!'] },
  { name: 'Sim-ple Life', store: 'Humble Bundle', kind: 'bundle', date: '2023-02-03', price: null, games: [
    'Garden Paws', 'Lake', "Luna's Fishing Garden", 'Staxel', 'Summer in Mara', 'Townscaper',
    'Winkeltje: The Little Shop', 'Yonder: The Cloud Catcher Chronicles'] },
  { name: 'February 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-02-07', price: null, games: [
    'Fallout', 'Fallout 76', 'Five Dates', 'Fobia - St. Dinfna Hotel', 'Othercide',
    'Pathfinder: Wrath of the Righteous - Enhanced Edition', 'ScourgeBringer', 'Shady Part of Me',
    'Thronebreaker: The Witcher Tales'] },
  { name: 'Love is in the Air', store: 'Humble Bundle', kind: 'bundle', date: '2023-02-08', price: null, games: [
    'A Story Beside', 'Ambition: A Minuet in Power', 'Kaichu - A Kaiju Dating Sim', 'Later Daters',
    'Max Gentlemen Sexy Business!', 'Sucker for Love', 'ValiDate: Volume 1', 'When The Past Was Around'] },
  { name: 'Steamy Sakura Special', store: 'Humble Bundle', kind: 'bundle', date: '2023-02-10', price: null, games: [
    'Sakura Alien', 'Sakura Dungeon', 'Sakura Forest Girls', 'Sakura Forest Girls 2', 'Sakura Forest Girls 3',
    'Sakura Knight', 'Sakura Knight 2', 'Sakura Knight 3', 'Sakura MMO', 'Sakura MMO 2', 'Sakura MMO 3',
    'Sakura MMO Extra', 'Sakura Succubus', 'Sakura Succubus 2', 'Sakura Succubus 3', 'Sakura Succubus 4'] },
  { name: 'Fishing Season Bassmaster & More', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-02-17', price: null, games: [
    'Euro Fishing', 'Euro Fishing: Foundry Dock', 'Euro Fishing: The Moat', 'Fishing Sim World: Pro Tour',
    'Fishing Sim World: Pro Tour - Lago del mundo', 'Fishing Sim World: Pro Tour - Talon Fishery',
    'Bassmaster® Fishing', 'Bassmaster® Fishing 2022: Predator Equipment Pack', 'Euro Fishing: Waldsee',
    'Fishing Sim World: Pro Tour - Bass Pro Shops Equipment Pack', 'Fishing Sim World®: Pro Tour - Big Fish Lure Pack',
    'Fishing Sim World: Pro Tour - Laguna Iquitos', 'Fishing Sim World: Pro Tour - Lake Arnold',
    'The Catch: Carp & Coarse Fishing', 'Bassmaster® Fishing 2022: Elite Fishing Equipment Pack',
    'Bassmaster® Fishing 2022: Jordan Lake'] },
  { name: 'Unparalleled Puzzlers', store: 'Humble Bundle', kind: 'bundle', date: '2023-02-24', price: null, games: [
    'Baba Is You', 'Creaks', 'DARQ', 'Dorfromantik', 'Monument Valley', 'Monument Valley 2', 'The Last Campfire'] },
  { name: 'Türkiye-Syria Earthquake Relief Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-03-01', price: null, games: [
    '112 Operator', '911 Operator', 'Agent in Depth', "Alchemist's Castle", 'Arcade Spirits', 'Armello', 'Calico',
    'Cats and the Other Lives', 'Cosmic Express', 'Cris Tales', 'Death Squared', 'Detached: Non-VR Edition',
    'Doughlings: Arcade', 'Doughlings: Invasion', 'Euro Truck Simulator 2', 'Farming Simulator 17'] },
  { name: 'March 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-03-07', price: null, games: [
    'BIOMUTANT', 'Demon Turf', 'Edge Of Eternity', 'Golden Light', "Hero's Hour", 'Jurassic World Evolution 2',
    'Monster Crown', 'Rogue Lords'] },
  { name: 'Humble Heroines: Warriors, Dreamers, and God Slayers', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-03-08', price: null, games: [
    'Batora: Lost Haven', 'Call of the Sea', 'Control Ultimate Edition', 'Dreamscaper', "Hellblade: Senua's Sacrifice",
    'Praey for the Gods', 'Sable', 'Syberia - The World Before'] },
  { name: 'Train Simulator Classic: On the Fast Track', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-03-10', price: null, games: [
    'Train Simulator Classic 2022 Store & Humble Bundle package', 'Train Simulator: DB BR 204 Loco Add-On',
    'Train Simulator: European Loco & Asset Pack', 'Train Simulator: London-Faversham High Speed Route Add-On',
    'Train Simulator: Norfolk Southern Coal District Route Add-On', 'Train Simulator: Sherman Hill Route Add-On',
    'Train Simulator: Clinchfield Railroad U36C Loco Add-On',
    'Train Simulator: Clinchfield Railroad: Elkhorn City - St. Paul Route Add-On',
    'Train Simulator: Frankfurt - Koblenz Route Add-On',
    'Train Simulator: Granger Heartland: Kansas City – Topeka Route Add-On',
    'Train Simulator: Inselbahn: Stralsund – Sassnitz Route Add-On', 'Train Simulator: London to Brighton Route Add-On',
    'Train Simulator: MRCE Dispolok Pack Loco Add-On', 'Train Simulator: Norfolk Southern N-Line Route Add-On',
    'Train Simulator: Portsmouth Direct Line: London Waterloo - Portsmouth Route Add-On',
    'Train Simulator: South London Network Route Add-On'] },
  { name: 'Kart Racers Games Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2023-03-15', price: null, games: [
    'All-Star Fruit Racing', 'Beach Buggy Racing 2', 'Garfield Kart - Furious Racing', 'Monster League',
    'Nickelodeon Kart Racers 2: Grand Prix', 'Super Indie Karts', 'Zeepkist',
    'Nickelodeon Kart Racers 3: Slime Speedway'] },
  { name: 'Scary Games to Play in the Dark', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-03-24', price: null, games: [
    'Labyrinthine', 'Propnight', 'The Blackout Club', 'Them and Us', 'SCP: 5K (Alpha Testing)',
    'The Mortuary Assistant', 'Visage'] },
  { name: 'Best of Boomer Shooters: Bigger and Boomier', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-03-29', price: null, games: [
    'Impaler Gold', 'Forgive Me Father', 'The Citadel', 'Viscerafest', 'Deadlink', 'GRAVEN', 'Nightmare Reaper',
    'WRATH: Aeon of Ruin'] },
  { name: 'Best of Survivors-Like', store: 'Humble Bundle', kind: 'bundle', date: '2023-03-31', price: null, games: [
    'Boneraiser Minions', 'Bounty of One', 'Just King', 'Neon Sundown', 'Nomad Survival', 'Repetendium',
    'Rogue: Genesia', 'Scarlet Tower'] },
  { name: 'Shared Screen Time: Family Game Night', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-04-12', price: null, games: [
    'Ben 10: Power Trip', 'Cobra Kai: The Karate Kid Saga Continues', 'Fast & Furious: Spy Racers Rise of SH1FT3R',
    'Gigantosaurus The Game', 'Jumanji: The Video Game', 'Little League World Series Baseball 2022',
    'MY LITTLE PONY: A Maretime Bay Adventure', 'Nickelodeon All-Star Brawl', 'Nickelodeon Kart Racers 2: Grand Prix',
    'PAW Patrol The Movie: Adventure City Calls'] },
  { name: 'In Your Face VR', store: 'Humble Bundle', kind: 'bundle', date: '2023-04-19', price: null, games: [
    'Superfly', 'Vertigo Remastered', 'Into the Radius VR', 'RUMBLE', 'BattleGroupVR', 'Wanderer', 'Zenith: Nexus'] },
  { name: 'Fight 4 Your Friends: Co-op Shooters', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-04-21', price: null, games: [
    'Killing Floor 2 Digital Deluxe Edition', 'The Anacrusis', 'Warhammer: Vermintide 2', 'Zombie Army Trilogy',
    'Back 4 Blood', 'Zombie Army 4: Dead War'] },
  { name: 'Striking Soulslikes Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-04-28', price: null, games: [
    'Salt and Sanctuary', 'Blade of Darkness', 'Mortal Shell', 'Aeterna Noctis', 'Dread Delusion', 'Loot River',
    'Sands of Aura'] },
  { name: 'May 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-05-02', price: null, games: [
    'Behind the Frame: The Finest Scenery', 'Bendy and the Dark Revival', 'Builder Simulator', 'Operation Tango',
    'Spiritfarer®: Farewell Edition', 'The Invisible Hand', 'Warhammer 40,000: Chaos Gate - Daemonhunters',
    'Windjammers 2'] },
  { name: 'Feel the Rhythm', store: 'Humble Bundle', kind: 'bundle', date: '2023-05-03', price: null, games: [
    'Disaster Band', 'Project Arrhythmia', "Melody's Escape 2", 'Soundfall', 'Trombone Champ', 'Beat Hazard 3',
    'No Straight Roads: Encore Edition'] },
  { name: 'Easy-going Games: Whitethorn Showcase', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-05-05', price: null, games: [
    'Beasts of Maravilla Island', "Evan's Remains", 'Newt One', 'StarCrossed', 'Teacup', 'We should talk.', 'Aground',
    'Calico', 'Princess Farmer', 'APICO', 'Lake', 'Wytchwood'] },
  { name: 'Capcom Heroic Collection', store: 'Humble Bundle', kind: 'bundle', date: '2023-05-10', price: null, games: [
    'Bionic Commando Rearmed', 'Lost Planet 3 - Complete Pack', 'Mega Man Legacy Collection', 'Strider',
    "Dragon's Dogma: Dark Arisen", 'Mega Man 11', 'Mega Man Legacy Collection 2', 'MONSTER HUNTER RISE',
    'Phoenix Wright: Ace Attorney Trilogy', 'Street Fighter 30th Anniversary Collection'] },
  { name: 'May Multiplayer Madness', store: 'Humble Bundle', kind: 'bundle', date: '2023-05-17', price: null, games: [
    'Generation Zero®', 'Midnight Ghost Hunt', 'Northgard', 'Borderlands 3: Super Deluxe Edition',
    'Destiny 2: Beyond Light Pack', 'Gloria Victis', 'PULSAR: Lost Colony'] },
  { name: 'Luck of the Draw: Roguelike Deckbuilders', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-05-19', price: null, games: [
    'Dicey Dungeons', 'Luck be a Landlord', 'Alina of the Arena', 'Chrono Ark', 'Tainted Grail', 'Beneath Oresa',
    'Fights in Tight Spaces'] },
  { name: 'Must-Play Metroidvanias', store: 'Humble Bundle', kind: 'bundle', date: '2023-05-31', price: null, games: [
    'Blasphemous', 'Bloodstained: Ritual of the Night', 'Haiku, the Robot', 'Hollow Knight', 'Lone Fungus',
    'Lost Ruins', 'Rain World'] },
  { name: 'June 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-06-06', price: null, games: [
    'Curse of the Dead Gods', 'Eternal Threads', 'Ghostwire: Tokyo', 'GRIME', 'Honey, I Joined a Cult',
    'Meeple Station', 'Remnant: From the Ashes - Complete Edition', 'Turbo Golf Racing'] },
  { name: 'Pixel Pride', store: 'Humble Bundle', kind: 'bundle', date: '2023-06-07', price: null, games: [
    'BAD END THEATER', 'Celeste', 'Get In The Car, Loser!', 'Later Alligator', 'Boyfriend Dungeon', 'Growing Up',
    'Super Lesbian Animal RPG'] },
  { name: 'Upload VR Showcase - Summer 2023', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-06-13', price: null, games: [
    'Maskmaker', 'Warhammer Age of Sigmar: Tempestfall', 'Green Hell VR', 'Pistol Whip',
    'The Walking Dead: Saints & Sinners', 'Dragon Fist: VR Kung Fu',
    'The Walking Dead: Saints & Sinners - Chapter 2: Retribution'] },
  { name: 'Summer Sports Spectacular: NBA 2K23 & More', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-06-14', price: null, games: [
    'NBA 2K Playgrounds 2', 'WWE 2K BATTLEGROUNDS', 'Lethal League Blaze', 'NBA 2K23', 'OlliOlli World', 'Wave Break',
    'Tape to Tape'] },
  { name: 'PAYDAY 2: Return of The Ultimate Score Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-06-16', price: null, games: [
    'PAYDAY 2', 'PAYDAY 2: Legacy Collection (Koch Tier 1)', 'PAYDAY 2: Silk Road Collection (Koch Tier 1)',
    'PAYDAY 2: City of Gold Collection (Koch Tier 1)'] },
  { name: 'Train Sim World 3 Mega Haul', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-06-28', price: null, games: [
    'Train Sim World® 3', "Train Sim World®: BR Class 20 'Chopper' Loco Add-On - TSW2 & TSW3 compatible",
    'Train Sim World®: Cathcart Circle Line: Glasgow - Newton & Neilston Route Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: Clinchfield Railroad: Elkhorn - Dante Route Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: LIRR M3 EMU Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: Brighton Main Line: London Victoria - Brighton Route Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: Caltrain MP36PH-3C Baby Bullet Loco Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: Hauptstrecke Hamburg - Lübeck Route Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: Nahverkehr Dresden -Riesa Route Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: Northern Trans-Pennine: Manchester - Leeds Route Add-On - TSW2 & TSW3 compatible',
    'Train Sim World® 3: Birmingham Cross-City Line: Lichfield - Bromsgrove & Redditch Route Add-On',
    'Train Sim World®: Great Western Express Route Add-On TSW2 & TSW3 compatible',
    'Train Sim World®: Long Island Rail Road: New York - Hicksville Route Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: Peninsula Corridor: San Francisco - San Jose Route Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: Rhein-Ruhr Osten: Wuppertal - Hagen Route Add-On - TSW2 & TSW3 compatible',
    'Train Sim World®: Tees Valley Line: Darlington - Saltburn-by-the-Sea Route Add-On - TSW2 & TSW3 compatible'] },
  { name: 'July 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-07-04', price: null, games: [
    'Kraken Academy!!', 'Merchant of the Skies', 'Ozymandias', 'Roadwarden', 'Shotgun King: The Final Checkmate',
    'Temtem', "The Outer Worlds: Spacer's Choice Edition", 'Yakuza 4 Remastered'] },
  { name: 'Cyberpunk Playground', store: 'Humble Bundle', kind: 'bundle', date: '2023-07-12', price: null, games: [
    'Cloudpunk', 'Voltage High Society', 'Ghostrunner', 'Severed Steel', 'ANNO:Mutationem', 'Gungrave G.O.R.E',
    'Observer: System Redux'] },
  { name: 'At-Home Arcade', store: 'Humble Bundle', kind: 'bundle', date: '2023-07-14', price: null, games: [
    'Mortal Kombat 11', 'Pinball FX - Indiana Jones™:  The Pinball Adventure',
    'Pinball FX3 - Indiana Jones™: The Pinball Adventure', 'Terror of Hemasaurus', 'THE HOUSE OF THE DEAD: Remake',
    'Ultimate Add-On Bundle', 'Redout 2', 'River City Girls', 'TRAIL OUT'] },
  { name: 'Whimsy & Wonder: A Cozy Games Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-07-19', price: null, games: [
    'A Short Hike', 'Assemble with Care', 'Alba: A Wildlife Adventure', 'Garden Story', 'Lemon Cake',
    'Cat Cafe Manager', 'Here Comes Niko!', 'Witchy Life Story'] },
  { name: 'Myst & More Redux: 30 Years of Myst', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-07-21', price: null, games: [
    'Cosmic Osmo', 'Manhole', 'Myst III: Exile', 'Myst IV: Revelation', 'Myst V', 'Myst: Masterpiece Edition',
    'Obduction', 'realMyst: Masterpiece Edition', 'Riven (1997)', 'Spelunx', 'Uru: Complete Chronicles', 'Myst'] },
  { name: "RPG Legends: Baldur's Gate & Beyond", store: 'Humble Bundle', kind: 'bundle',
    date: '2023-07-26', price: null, games: [
    'Icewind Dale: Enhanced Edition', 'Planescape: Torment: Enhanced Edition', "Baldur's Gate II: Enhanced Edition",
    "Baldur's Gate: Enhanced Edition", "Baldur's Gate: Faces of Good and Evil", "Baldur's Gate: Siege of Dragonspear",
    'Neverwinter Nights: Enhanced Edition', 'Neverwinter Nights: Enhanced Edition Dark Dreams of Furiae',
    'Neverwinter Nights: Enhanced Edition Darkness Over Daggerford',
    'Neverwinter Nights: Enhanced Edition Infinite Dungeons',
    'Neverwinter Nights: Enhanced Edition Pirates of the Sword Coast',
    'Neverwinter Nights: Enhanced Edition Tyrants of the Moonsea',
    'Neverwinter Nights: Enhanced Edition Wyvern Crown of Cormyr',
    'Pathfinder: Wrath of the Righteous - Enhanced Edition', 'MythForce'] },
  { name: 'August 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-08-01', price: null, games: [
    'Chivalry 2', 'Disco Elysium', 'Hot Brass', 'Road 96', 'SuchArt!', 'Tin Can', 'Trek to Yomi'] },
  { name: 'The Ultimate Racing Sim Bundle - Victory Lap', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-08-03', price: null, games: [
    'Assetto Corsa Competizione', 'Assetto Corsa Ultimate Edition', 'Automobilista', 'Automobilista 2', 'DRIFT CE',
    'NASCAR Heat 5', 'NASCAR Heat 5 - Ultimate Pass', 'rFactor 2'] },
  { name: 'Jackbox Jukebox: Playing the Odds', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-08-04', price: null, games: [
    'Fibbage XL', 'Quiplash 2 InterLASHional', 'The Jackbox Party Pack', 'The Jackbox Party Starter',
    'The Jackbox Party Pack 3', 'The Jackbox Party Pack 5', 'The Jackbox Party Pack 7', 'The Jackbox Party Pack 9'] },
  { name: 'Resident Evil: Decades of Horror - Village Edition', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-08-09', price: null, games: [
    'Resident Evil', 'Resident Evil Revelations', 'Resident Evil Revelations 2', 'Resident Evil 0',
    'Resident Evil 4 (2005)', 'Resident Evil 5 Gold Edition', 'Resident Evil 6',
    'Resident Evil Revelations 2 / Biohazard Revelations 2 Deluxe Edition', 'Resident Evil 2', 'Resident Evil 3',
    'Resident Evil 7 Biohazard', 'Resident Evil Village'] },
  { name: 'Take Your Turn: Tactics & RPGs', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-08-11', price: null, games: [
    'Coromon', 'Jack Move', 'Jupiter Hell', 'The Banner Saga Trilogy Deluxe Pack', 'Panzer Corps 2',
    'Songs of Conquest', 'The Dungeon Of Naheulbeuk: The Amulet Of Chaos',
    'The Dungeon Of Naheulbeuk: The Amulet Of Chaos - Goodies Pack',
    'The Dungeon Of Naheulbeuk: The Amulet Of Chaos Soundtrack'] },
  { name: 'Spaced Out', store: 'Humble Bundle', kind: 'bundle', date: '2023-08-16', price: null, games: [
    'Breathedge', 'Journey To The Savage Planet', 'The Entropy Centre', 'The Outer Worlds', 'Trover Saves the Universe',
    'High On Life', 'The Outer Worlds Expansion Pass'] },
  { name: 'If You Build It- Cities & More', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-08-18', price: null, games: [
    'Evil Genius 2', 'Frozenheim', 'Airborne Kingdom', "Pan'orama", 'The Tenants', 'Prehistoric Kingdom',
    'The Universim'] },
  { name: 'Masterful Modern 3D Platformers', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-08-23', price: null, games: [
    "New Super Lucky's Tale", 'Pumpkin Jack', 'Demon Turf', 'Hell Pie', 'Kao the Kangaroo', 'The Spirit and the Mouse',
    'A Hat in Time', 'A Hat in Time - Seal the Deal'] },
  { name: 'Dino Fever', store: 'Humble Bundle', kind: 'bundle', date: '2023-08-30', price: null, games: [
    'Animal Revolt Battle Simulator', 'Primal Carnage: Extinction', 'Turok', 'Turok 2: Seeds of Evil',
    'Carnivores: Dinosaur Hunt', 'Dinosaur Fossil Hunter', 'Prehistoric Hunt', 'Saurian'] },
  { name: 'Tales from Wales Interactive', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-09-01', price: null, games: [
    'Bloodshore', 'Late Shift', 'Five Dates', 'Mia and the Dragon Princess', 'The Bunker', 'The Complex'] },
  { name: 'September 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-09-05', price: null, games: [
    'Aces and Adventures', 'Autonauts vs Piratebots', 'Deceive Inc.', 'Foretales', 'Patch Quest', 'The Forgotten City',
    "Tiny Tina's Wonderlands: Chaotic Great Edition", 'Who Pressed Mute on Uncle Marcus?'] },
  { name: 'PC Building Simulator Rebooted', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-09-06', price: null, games: [
    'PC Building Simulator', 'PC Building Simulator - Overclocked Edition Content',
    'PC Building Simulator - Overclockers UK Workshop', 'PC Building Simulator - Razer Workshop',
    'PC Building Simulator - Republic of Gamers Workshop', 'PC Building Simulator - AORUS Workshop',
    'PC Building Simulator - Esports Expansion', 'PC Building Simulator - EVGA Workshop',
    'PC Building Simulator - Fractal Design Workshop', 'PC Building Simulator - NZXT Workshop'] },
  { name: 'Strike from the Shadows: Top-Down Stealth', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-09-08', price: null, games: [
    'Intravenous', 'Shadow Tactics: Blades of the Shogun', "Shadow Tactics: Blades of the Shogun - Aiko's Choice",
    'Tunguska: The Visitation - Enhanced Edition', 'Mutant Year Zero: Road to Eden', 'Serial Cleaners',
    'War Mongrels'] },
  { name: 'Cities Skylines: Build Today, Plan for Tomorrow!', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-09-13', price: null, games: [
    'Cities: Skylines', 'Cities: Skylines - Deluxe Pack', 'Cities: Skylines - JADIA Radio',
    'Cities: Skylines - Natural Disasters', 'Cities: Skylines - Content Creator Pack: Heart of Korea',
    'Cities: Skylines - Content Creator Pack: Map Pack', 'Cities: Skylines - Content Creator Pack: Mid-Century Modern',
    'Cities: Skylines - Content Creator Pack: Seaside Resorts',
    'Cities: Skylines - Content Creator Pack: Vehicles of the World', 'Cities: Skylines - Snowfall',
    'Cities: Skylines - African Vibes', 'Cities: Skylines - Airports',
    'Cities: Skylines - Content Creator Pack: Africa in Miniature',
    'Cities: Skylines - Content Creator Pack: Map Pack 2', 'Cities: Skylines - Content Creator Pack: Shopping Malls',
    'Cities: Skylines - Content Creator Pack: Skyscrapers'] },
  { name: 'Untold Tales of Adventure', store: 'Humble Bundle', kind: 'bundle', date: '2023-09-15', price: null, games: [
    "Aspire: Ina's Tale", 'Golf Club Nostalgia', 'Mythic Ocean', 'SAMUDRA', 'What Lies in the Multiverse',
    'Arise: A Simple Story', 'ATONE: Heart of the Elder Tree', 'Flame Keeper', 'Metamorphosis',
    'Bang-On Balls: Chronicles'] },
  { name: 'Get Your Head in the Game VR', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-09-20', price: null, games: [
    'Rick and Morty: Virtual Rick-ality', 'STRIDE', 'Zero Caliber VR', 'After the Fall® - Deluxe Edition',
    'I Expect You To Die 2', 'Propagation: Paradise Hotel', 'Demeo', 'Grimlord'] },
  { name: 'HeroCraft PC Complete Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-09-20', price: null, games: [
    'Warhammer 40,000: Space Wolf', 'Warhammer 40,000: Space Wolf - Drenn Redblade',
    'Warhammer 40,000: Space Wolf - Fall of Kanak', 'Warhammer 40,000: Space Wolf - Saga of the Great Awakening',
    'Warhammer 40,000: Space Wolf - Sentry Gun Pack', 'Warhammer 40,000: Space Wolf - Wolf Priest',
    'Warhammer 40,000: Space Wolf - Wrath of the Damned', 'FootLOL: Epic Soccer League', 'INSOMNIA: The Ark',
    'King of Dragon Pass', 'Gravewood High - Complete package', 'Organs Please', 'Anvil Saga', 'Catizens', 'Tempest',
    'Tempest - Jade Sea'] },
  { name: 'Control the Narrative', store: 'Humble Bundle', kind: 'bundle', date: '2023-09-22', price: null, games: [
    'Before Your Eyes', 'Impostor Factory', 'Tales from the Borderlands', 'Beyond a Steel Sky', 'Beyond: Two Souls',
    'Twin Mirror', 'New Tales from the Borderlands', 'OPUS: Echo of Starsong - Full Bloom Edition'] },
  { name: 'Awesome Indies from Humble Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-09-27', price: null, games: [
    'Fae Tactics', 'Ikenfell', 'Ring of Pain', 'Archvale', 'Flynn: Son of Crimson', 'UNSIGHTED', 'Void Bastards',
    'Dodgeball Academia', 'Moonscars', 'The Wild at Heart'] },
  { name: 'October 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-10-03', price: null, games: [
    "A Juggler's Tale", 'Lords and Villeins', 'Metal: Hellsinger', 'Mr. Prepper', 'Rebel Inc: Escalation',
    'Spirit Of The Island', 'The Dark Pictures Anthology: House of Ashes', 'The Quarry - Deluxe Edition'] },
  { name: 'Laugh Til You Die: Multiplayer Mayhem', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-10-06', price: null, games: [
    'ROUNDS', 'Stick Fight: The Game', 'Boomerang Fu', 'Ultimate Chicken Horse', 'Heavenly Bodies', 'KeyWe',
    'PlateUp!'] },
  { name: 'Bandai Namco: Fights, Frights, and Fantasy', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-10-11', price: null, games: [
    '.hack//G.U. Last Recode', 'CODE VEIN', 'GOD EATER 3', 'Katamari Damacy REROLL', 'PAC-MAN MUSEUM+',
    'Tales of Vesperia: Definitive Edition', 'TEKKEN 7'] },
  { name: 'Fright of your Life', store: 'Humble Bundle', kind: 'bundle', date: '2023-10-13', price: null, games: [
    "Alan Wake Collector's Edition", 'Bendy and the Dark Revival', 'Bendy and the Ink Machine', 'Hidden Deep',
    'Moons of Madness', 'Pathologic 2', 'STASIS: BONE TOTEM', 'Tormented Souls'] },
  { name: 'Living in a Simulation', store: 'Humble Bundle', kind: 'bundle', date: '2023-10-18', price: null, games: [
    'Electrician Simulator', 'Fresh Start Cleaning Simulator', 'Juno: New Origins', "Lumberjack's Dynasty",
    'Builder Simulator', 'Farming Simulator 19', 'Firefighting Simulator - The Squad', 'House Flipper',
    'House Flipper - Garden DLC', 'House Flipper - Luxury DLC'] },
  { name: "Sid Meier's Ultimate Collection: One More Turn", store: 'Humble Bundle', kind: 'bundle',
    date: '2023-10-20', price: null, games: [
    'Civilization: Beyond Earth – The Collection', "Sid Meier's Civilization IV: The Complete Edition",
    "Sid Meier's Civilization V: Complete Edition", "Sid Meier's Civilization VI - Civilization & Scenario Pack Bundle",
    "Sid Meier's Ace Patrol", "Sid Meier's Ace Patrol: Pacific Skies", "Sid Meier's Civilization III: Complete",
    "Sid Meier's Civilization VI", "Sid Meier's Civilization® VI: Gathering Storm",
    "Sid Meier's Civilization® VI: Rise and Fall", "Sid Meier's Colonization (Classic)",
    "Sid Meier's Covert Action (Classic)", "Sid Meier's Pirates!", "Sid Meier's Railroads!", "Sid Meier's Starships"] },
  { name: 'WB 100: Play the Legends', store: 'Humble Bundle', kind: 'bundle', date: '2023-10-27', price: null, games: [
    'Batman: Arkham Asylum GOTY Edition', 'Batman: Arkham City GOTY', 'Mad Max',
    'Middle-earth: Shadow of Mordor Game of the Year Edition', 'Mortal Kombat XL',
    'Batman: Arkham Knight Premium Edition', 'Batman: Arkham Origins', 'Injustice 2 Legendary Edition',
    'Middle-earth: Shadow of War Definitive Edition', 'Mortal Kombat 11', 'Ultimate Add-On Bundle', 'Back 4 Blood',
    'Gotham Knights'] },
  { name: "IGN Editors' Choice: The 9 and Above Club", store: 'Humble Bundle', kind: 'bundle',
    date: '2023-11-01', price: null, games: [
    'Chivalry 2', 'Disco Elysium', 'GRIME', 'Paradise Killer', 'Spiritfarer®: Farewell Edition', 'The Forgotten City',
    'Wildermyth'] },
  { name: 'November 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-11-07', price: null, games: [
    'Friends vs Friends', 'Hardspace: Shipbreaker', 'Prodeus', 'SCP : Secret Files', 'Souldiers',
    'The Legend of Tianding', 'Unpacking', 'WWE 2K23'] },
  { name: 'Adventures in the 2nd Dimension: Positively Playful Platformers', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-11-08', price: null, games: [
    'Hoa', 'Minute of Islands', 'One Hand Clapping', 'Pogostuck: Rage With Your Friends', 'Super Bunny Man',
    'Toodee and Topdee', 'Webbed', 'Will You Snail?'] },
  { name: 'WePlay Expo - Discover China Indies', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-11-11', price: null, games: [
    'Lost Castle', 'Unheard', 'My Time at Portia', 'The Rewinder', '斩妖行 Eastern Exorcist', "Let's School",
    'Sands of Salzaar', 'Sands of Salzaar - The Ember Saga', '部落与弯刀 - 比武大会', '风帆纪元 Sailing Era'] },
  { name: 'Action Roguelikes: What Kills You Makes You Stronger', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-11-15', price: null, games: [
    'CRYPTARK', 'God Of Weapons', 'Wall World', 'Dead Estate', 'Paint the Town Red', 'Barony', 'Lumencraft'] },
  { name: 'Wargaming By Air, Land, and Sea', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-11-17', price: null, games: [
    'World of Tanks — French Express Pack', 'World of Warplanes -I-16-29 Pack', 'World of Warships — Smith Steam Pack',
    'World of Tanks — Lightweight Fighter Pack', 'World of Warplanes - Messerschmitt Me 210 Pack',
    'World of Warships — Marblehead Lima Steam Pack', 'World of Tanks — Elusive Menace Pack',
    'World of Warplanes - SNCASE SE 100 Pack', 'World of Warships — Texas Pack'] },
  { name: 'Black Friday Score: The Walking Dead & More from Skybound', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-11-24', price: null, games: [
    'The Walking Dead', 'Rainbow Billy: The Curse of the Leviathan', 'Renfield: Bring Your Own Blood', 'The Big Con',
    'The Walking Dead: 400 Days', 'The Walking Dead: Season Two', 'Thief of Thieves: Season One', 'Glitch Busters',
    'Homestead Arcana', 'The Walking Dead: A New Frontier', 'The Walking Dead: Michonne',
    'The Walking Dead: The Final Season', 'WrestleQuest', 'The Walking Dead: Saints & Sinners',
    'The Walking Dead: Saints & Sinners - Chapter 2: Retribution'] },
  { name: 'Fight T1D With JRPGs!', store: 'Humble Bundle', kind: 'bundle', date: '2023-11-29', price: null, games: [
    'Bug Fables: The Everlasting Sapling', 'Dark Deity', 'Eiyuden Chronicle: Rising', 'Nexomon: Extinction',
    'Edge Of Eternity', 'Mato Anomalies', 'Symphony of War: The Nephilim Saga'] },
  { name: 'Uplifting Adventures: A Wholesome Games Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-01', price: null, games: [
    'Bear and Breakfast', 'Mail Time', 'Smushi Come Home', 'Tinykin', 'Venba', 'Passpartout 2: The Lost Artist',
    'Wylde Flowers'] },
  { name: 'December 2023 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2023-12-05', price: null, games: [
    'ELEX II', 'Expeditions: Rome', 'From Space', 'Last Call BBS', 'Midnight Fight Express', 'Nobody Saves the World',
    'The Gunk', 'The Pale Beyond'] },
  { name: 'The Upload VR Showcase - Winter 2023', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-06', price: null, games: [
    'AMID EVIL VR', 'Angry Birds VR: Isle of Pigs', 'Arizona Sunshine - Deluxe Edition', 'Cooking Simulator VR',
    'Garden of the Sea (VR)', 'Guardians Frontline', 'The Break-In'] },
  { name: 'Must-Play Metroidvanias Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-08', price: null, games: [
    'Blasphemous', 'Bloodstained: Ritual of the Night', 'Haiku, the Robot', 'Hollow Knight', 'Lone Fungus',
    'Lost Ruins', 'Rain World'] },
  { name: 'Luck of the Draw: Roguelike Deckbuilders Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-09', price: null, games: [
    'Alina of the Arena', 'Banners of Ruin - Collection', 'Chrono Ark', 'Dicey Dungeons', 'Luck be a Landlord',
    'Tainted Grail', 'Fights in Tight Spaces'] },
  { name: 'Valiant VR Encore', store: 'Humble Bundle', kind: 'bundle', date: '2023-12-10', price: null, games: [
    'Budget Cuts 2: Mission Insolvency', 'Contractors VR', 'Dragon Fist: VR Kung Fu', 'Hard Bullet',
    'Into the Radius VR', 'Takelings House Party', 'VTOL VR'] },
  { name: 'Whimsy & Wonder: A Cozy Games Collection Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-11', price: null, games: [
    'A Short Hike', 'Alba: A Wildlife Adventure', 'Assemble with Care', 'Cat Cafe Manager', 'Garden Story',
    'Here Comes Niko!', 'Lemon Cake', 'Witchy Life Story'] },
  { name: 'Unparalleled Puzzlers Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-12', price: null, games: [
    'Baba Is You', 'Creaks', 'DARQ', 'Dorfromantik', 'Monument Valley', 'Monument Valley 2', 'The Last Campfire'] },
  { name: 'Spaced Out Encore', store: 'Humble Bundle', kind: 'bundle', date: '2023-12-13', price: null, games: [
    'Breathedge', 'Journey To The Savage Planet', 'The Entropy Centre', 'The Outer Worlds', 'Trover Saves the Universe',
    'High On Life', 'The Outer Worlds Expansion Pass'] },
  { name: 'Scary Games to Play in the Dark Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-14', price: null, games: [
    'Labyrinthine', 'SCP: 5K (Alpha Testing)', 'The Blackout Club', 'The Mortuary Assistant', 'Them and Us',
    'Visage'] },
  { name: 'Humble Heroines: Warriors, Dreamers, and God Slayers Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-15', price: null, games: [
    'Batora: Lost Haven', 'Call of the Sea', 'Control Ultimate Edition', 'Dreamscaper', "Hellblade: Senua's Sacrifice",
    'Praey for the Gods', 'Sable', 'Syberia - The World Before'] },
  { name: 'Fight 4 Your Friends: Co-op Shooters Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-16', price: null, games: [
    'Back 4 Blood', 'Killing Floor 2 Digital Deluxe Edition (without inventory gift)', 'The Anacrusis',
    'Warhammer: Vermintide 2', 'Zombie Army 4: Dead War', 'Zombie Army Trilogy'] },
  { name: 'In Your Face VR Encore', store: 'Humble Bundle', kind: 'bundle', date: '2023-12-17', price: null, games: [
    'BattleGroupVR', 'Into the Radius VR', 'RUMBLE', 'Superfly', 'Vertigo Remastered', 'Wanderer', 'Zenith: Nexus'] },
  { name: 'Laugh Til You Die: Multiplayer Mayhem Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2023-12-18', price: null, games: [
    'Heavenly Bodies', 'KeyWe', 'PlateUp!', 'ROUNDS', 'Stick Fight: The Game', 'Ultimate Chicken Horse'] },
  { name: 'January 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-01-02', price: null, games: [
    'Aragami 2', 'Doctor Strange Defenders Skin', 'Hell Pie', "Marvel's Midnight Suns Digital+ Edition", 'OTXO',
    'Roguebook', 'The Red Lantern', 'Twin Mirror', 'Two Point Campus'] },
  { name: 'Outright Heroes of Film & Television', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-01-03', price: null, games: [
    'Adventure Time: Pirates of the Enchiridion', 'Ben 10', 'Fast & Furious: Spy Racers Rise of SH1FT3R',
    'Hotel Transylvania 3: Monsters Overboard', 'TRANSFORMERS: BATTLEGROUNDS', 'Trollhunters: Defenders of Arcadia',
    'DC League of Super-Pets: The Adventures of Krypto and Ace', 'DreamWorks Dragons: Dawn of New Riders',
    "Ice Age: Scrat's Nutty Adventure", 'Jumanji: The Video Game', 'The Last Kids on Earth and the Staff of Doom!',
    'Ben 10: Power Trip', "DC's Justice League: Cosmic Chaos", 'DreamWorks Dragons: Legends of The Nine Realms',
    'Hotel Transylvania: Scary-Tale Adventures', 'Star Trek Prodigy: Supernova'] },
  { name: 'Play Pink With Twin Sails', store: 'Humble Bundle', kind: 'bundle', date: '2024-01-05', price: null, games: [
    'Love Letter', 'Splendor', 'Amberial Dreams', 'Carcassonne: The Official Board Game', 'Small World',
    'A Game Of Thrones - A Dance With Dragons', 'A Game Of Thrones - A Feast For Crows',
    'A Game of Thrones: The Board Game', "Arkham Horror: Mother's Embrace", 'Blood Rage: Digital Edition',
    'Blood Rage: Digital Edition - Gods of Asgard', 'Blood Rage: Digital Edition - Mystics of Midgard',
    'Blood Rage: Digital Edition - Mythical Monsters', 'Carcassonne - The Princess & the Dragon Expansion',
    'Carcassonne - Traders & Builders', 'Gloomhaven - Solo Scenarios: Mercenary Challenges'] },
  { name: 'Awesome Games Done Quick 2024', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-01-12', price: null, games: [
    'Astalon: Tears of the Earth', 'Bayonetta', 'Borderlands 2 Game of the Year', 'Celeste',
    'Sonic Adventure 2: Battle Mode DLC', 'Sonic Adventure™ 2', 'SPRAWL'] },
  { name: 'With Soulslike These... You Need Enemies', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-01-24', price: null, games: [
    'Arboria', 'Hellpoint', 'Tails of Iron', 'Clash: Artifacts of Chaos', 'Remnant: From the Ashes', 'Stray Blade',
    'Strayed Lights'] },
  { name: "Controller'd Chaos", store: 'Humble Bundle', kind: 'bundle', date: '2024-01-31', price: null, games: [
    'Destroy All Humans!', 'Ghostbusters: The Video Game Remastered', 'Rain on Your Parade', 'Sunset Overdrive',
    'Maneater', 'No More Heroes', 'Orcs Must Die! 3', 'Orcs Must Die! 3 - Cold as Eyes Expansion',
    'Orcs Must Die! 3 - Tipping the Scales DLC'] },
  { name: 'Exceptional Indie Allies', store: 'Humble Bundle', kind: 'bundle', date: '2024-02-02', price: null, games: [
    'APICO', 'Endling - Extinction is Forever', 'Mutazione', 'NORCO', 'Not For Broadcast', 'One Step From Eden',
    'Wytchwood'] },
  { name: 'February 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-02-06', price: null, games: [
    'Beacon Pines', 'Children of Silentown', 'Destroy All Humans! 2 - Reprobed', 'Life is Strange: True Colors',
    'Scorn', 'There Is No Light'] },
  { name: 'Mega Man Franchise Pack', store: 'Humble Bundle', kind: 'bundle', date: '2024-02-07', price: null, games: [
    'Mega Man Legacy Collection', 'Mega Man Legacy Collection 2', 'Mega Man X Legacy Collection', 'Mega Man 11',
    'Mega Man X Legacy Collection 2', 'Mega Man Zero/ZX Legacy Collection'] },
  { name: 'Mind-Bending Masterpieces', store: 'Humble Bundle', kind: 'bundle', date: '2024-02-09', price: null, games: [
    'Manifold Garden', 'Superliminal', 'The Pedestrian', 'The Talos Principle Gold Edition', 'The Witness',
    "Patrick's Parabox", 'Taiji'] },
  { name: 'Destiny 2: The Story So Far (Feb 2024)', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-02-13', price: null, games: [
    'Destiny 2: Forsaken Pack', 'Destiny 2: Shadowkeep Pack', 'Destiny 2: Beyond Light Pack',
    'Destiny 2: Bungie 30th Anniversary Pack', 'Destiny 2: The Witch Queen', 'Destiny 2: Lightfall',
    'Destiny 2: Lightfall + Annual Pass'] },
  { name: 'Capcom Cup: Fighters & Arcade Classics Pack', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-02-14', price: null, games: [
    'Ultra Street Fighter IV', 'Capcom Arcade 2nd Stadium Bundle', 'Capcom Arcade Stadium Packs 1, 2, and 3',
    'Street Fighter 30th Anniversary Collection', 'Street Fighter V - Champion Edition'] },
  { name: "IGN Fan Fest '24", store: 'Humble Bundle', kind: 'bundle', date: '2024-02-19', price: null, games: [
    'A Little to the Left', 'Black Book', 'Islets', 'Loop Hero', 'Shantae and the Seven Sirens', 'Tinykin',
    'Wobbledogs'] },
  { name: 'The Creative Sandbox', store: 'Humble Bundle', kind: 'bundle', date: '2024-02-28', price: null, games: [
    'From The Depths', 'My Little Universe', 'Necesse', 'TerraTech Deluxe Edition (non-Store)',
    'Trailmakers Deluxe Edition', 'Above Snakes', 'The Universim'] },
  { name: 'Games Done Quick - Frost Fatales 2024', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-03-01', price: null, games: [
    'ABZÛ', 'Dicey Dungeons', 'GYLT', 'Hylics 2', 'Maid of Sker', 'Mail Time', 'Pseudoregalia'] },
  { name: 'March 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-03-05', price: null, games: [
    'Afterimage', 'Black Skylands', 'Citizen Sleeper', 'Destroyer: The U-Boat Hunter', 'Nioh 2 – The Complete Edition',
    'Saints Row', 'Soulstice', 'Warhammer Age of Sigmar: Realms of Ruin Ultimate Edition'] },
  { name: 'Humble Heroines: Action, Adventure, & Intrigue', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-03-08', price: null, games: [
    'A Plague Tale: Innocence', 'Chorus', 'Metal: Hellsinger', 'Scars Above', 'Eastward', 'LISA: Complete Edition',
    'Wanted: Dead'] },
  { name: 'Plaion: The Hits - Saints Row & Red Faction Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-03-13', price: null, games: [
    'Red Faction', 'Red Faction II', 'Saints Row 2', 'Red Faction: Armageddon',
    'Red Faction: Armageddon - Path to War DLC', 'Saints Row: Gat out of Hell', 'Saints Row: The Third',
    'Red Faction Guerrilla Re-Mars-tered', 'Saints Row IV', 'Saints Row The Third Remastered'] },
  { name: 'Spring into Learning: The Complete Humongous Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-03-15', price: null, games: [
    'Big Thinkers 1st Grade', 'Big Thinkers Kindergarten', "Fatty Bear's Birthday Surprise",
    'Freddi Fish 2: The Case of the Haunted Schoolhouse', 'Freddi Fish 3: The Case of the Stolen Conch Shell',
    'Freddi Fish 4: The Case of the Hogfish Rustlers of Briny Gulch',
    'Freddi Fish 5: The Case of the Creature of Coral Cove', "Freddi Fish and Luther's Maze Madness",
    "Freddi Fish and Luther's Water Worries", 'Freddi Fish and the Case of the Missing Kelp Seeds',
    "Let's Explore The Airport (Junior Field Trips)", "Let's Explore The Farm (Junior Field Trips)",
    "Let's Explore The Jungle (Junior Field Trips)", "Pajama Sam 2: Thunder And Lightning Aren't So Frightening",
    'Pajama Sam 3: You Are What You Eat From Your Head To Your Feet',
    'Pajama Sam 4: Life Is Rough When You Lose Your Stuff!'] },
  { name: 'Earth Defense Force UNITED!', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-03-20', price: null, games: [
    'EARTH DEFENSE FORCE 4.1  The Shadow of New Despair', 'EARTH DEFENSE FORCE 4.1  WINGDIVER THE SHOOTER',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: BM03 Vegalta Gold',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Depth Crawler Gold Coat',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus DCC-Gogo. Marking',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus DCC-Zero Marking',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus Tank, Bullet Girls Marking',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus Tank, EDF IFPS Markings',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus Tank, Natsuiro HS Markings',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Pure Decoy Launcher 5 Pack B [Seira] [Miyabi] [Noko] [Mitsuki] [Anju]',
    'EARTH DEFENSE FORCE 4.1 - Fencer Weapons: Blood Storm', 'EARTH DEFENSE FORCE 4.1 - Fencer Weapons: Ifrit',
    'EARTH DEFENSE FORCE 4.1 - Mission Pack 1: Time of the Mutants',
    'EARTH DEFENSE FORCE 4.1 - Mission Pack 2: Extreme Battle',
    'EARTH DEFENSE FORCE 4.1 - Ranger Weapons: Pure Decoy Launcher 5 Pack A [Karia] [Moegi] [Chiri] [Ouka] [Rinrin]',
    'EARTH DEFENSE FORCE 4.1 - Ranger Weapons: Sting Shot'] },
  { name: 'Back with a Vengeance: The Best of Boomer Shooters', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-03-22', price: null, games: [
    'Deadlink', 'Forgive Me Father 2', 'POSTAL: Brain Damaged - Connoisseur Edition', 'Prodeus', 'Quake II',
    'Turbo Overkill', 'ULTRAKILL'] },
  { name: 'Slice, Dice, & Everything Nice: D3 After Dark', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-03-25', price: null, games: [
    'Ed-0: Zombie Uprising', 'Onechanbara Z2: Chaos', 'SG/ZH: School Girl/Zombie Hunter', 'MAGLAM LORD',
    'Omega Labyrinth Life', 'Bullet Girls Phantasia', 'Onee Chanbara Origin', 'SAMURAI MAIDEN'] },
  { name: 'Spring Screams', store: 'Humble Bundle', kind: 'bundle', date: '2024-03-27', price: null, games: [
    'Demonologist', 'DEVOUR', 'Escape the Backrooms', 'FOREWARNED', 'Ad Infinitum', 'Amnesia: The Bunker',
    'My Friendly Neighborhood', 'The Quarry'] },
  { name: 'Virtual Realities: Mystery & Mayhem', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-03-29', price: null, games: [
    "A Fisherman's Tale", 'Arizona Sunshine - Deluxe Edition', 'Broken Edge', "A Fisherman's Tale 2",
    'After the Fall® - Deluxe Edition', 'No More Rainbows', 'Firmament', 'The 7th Guest VR'] },
  { name: 'April 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-04-02', price: null, games: [
    'Coromon', 'HUMANKIND™ Definitive Edition', 'Symphony of War: The Nephilim Saga', 'The Callisto Protocol',
    "The Excavation of Hob's Barrow", 'Victoria 3'] },
  { name: 'Train Sim World 4: Top Up Your Timetable', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-04-03', price: null, games: [
    'Train Sim World® 4: Humble Bundle - Tier 1', 'Train Sim World® 4: Humble Bundle - Tier 2',
    'Train Sim World® 4: Humble Bundle - Tier 3'] },
  { name: 'Catch My Drift', store: 'Humble Bundle', kind: 'bundle', date: '2024-04-10', price: null, games: [
    'MudRunner', 'WRC 9 FIA World Rally Championship', 'Circuit Superstars', 'Inertial Drift',
    'Inertial Drift - Twilight Rivals Pack', 'art of rally', 'TRAIL OUT', 'WRC 10 FIA World Rally Championship'] },
  { name: 'Devious Deckbuilders', store: 'Humble Bundle', kind: 'bundle', date: '2024-04-12', price: null, games: [
    'Floppy Knights', 'Gordian Quest', 'Mahokenshi - The Samurai Deckbuilder', 'Zoeti', 'Astrea: Six-Sided Oracles',
    'Book of Hours', 'Dungeon Drafters'] },
  { name: 'Down on the Farm', store: 'Humble Bundle', kind: 'bundle', date: '2024-04-19', price: null, games: [
    'Littlewood', 'No Place Like Home', 'Cattails: Wildwood Story', 'Everdream Valley',
    'Ikonei Island: An Earthlock Adventure', 'Immortal Life', 'Cornucopia', 'The Witch of Fern Island'] },
  { name: 'Create, Automate & Manage', store: 'Humble Bundle', kind: 'bundle', date: '2024-04-24', price: null, games: [
    'Buggos', 'Factory Town', 'Recipe for Disaster', 'Astro Colony', 'Cardboard Town', 'Mob Factory',
    'The Colonists'] },
  { name: 'Team17: From Golf Greens to Battle Scenes', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-05-01', price: null, games: [
    'Golf With Your Friends', 'Moving Out', 'The Escapists 2', 'Neon Abyss', 'Neon Abyss - Alter Ego',
    'Neon Abyss - Chrono Trap', 'Neon Abyss Soundtrack', 'The Lovable Rogues Pack', 'Worms W.M.D', 'Gord',
    'Headbangers: Rhythm Royale', 'Trepang2'] },
  { name: 'FUNgeon Crawlers', store: 'Humble Bundle', kind: 'bundle', date: '2024-05-03', price: null, games: [
    'Devil Spire', 'Going Under', 'Hellslave', 'Lunacid', 'Siralim Ultimate', 'Abalon', 'MythForce'] },
  { name: 'May 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-05-07', price: null, games: [
    'Amanda the Adventurer', 'Bravery and Greed', 'Hi-Fi RUSH', 'King Of The Castle', 'Loddlenaut',
    'Mediterranea Inferno', 'Steelrising', 'Yakuza: Like a Dragon'] },
  { name: 'Metroidvania Mania', store: 'Humble Bundle', kind: 'bundle', date: '2024-05-08', price: null, games: [
    'Axiom Verge', 'The Knight Witch', '9 Years of Shadows', 'Axiom Verge 2', 'Cookie Cutter',
    "Death's Gambit: Afterlife", 'Ghost Song'] },
  { name: 'The Monster Hunter World & Rise Saga', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-05-15', price: null, games: [
    'MONSTER HUNTER RISE', 'MONSTER HUNTER RISE Deluxe Kit', 'Monster Hunter Rise: Sunbreak',
    'Monster Hunter Rise: Sunbreak Deluxe Kit', 'Monster Hunter: World', 'Monster Hunter: World - Deluxe Kit',
    'Monster Hunter World: Iceborne', 'Monster Hunter World: Iceborne Deluxe Kit'] },
  { name: "Brutal Beat 'Em Ups", store: 'Humble Bundle', kind: 'bundle', date: '2024-05-17', price: null, games: [
    'Battletoads', 'Bud Spencer & Terence Hill - Slaps And Beans', 'River City Girls Zero',
    'Bud Spencer & Terence Hill - Slaps And Beans 2', 'River City Girls', 'Double Dragon Gaiden: Rise of the Dragons',
    'River City Girls 2'] },
  { name: 'Fully Loaded: Nightdive FPS Remasters', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-05-22', price: null, games: [
    'Blood: Fresh Supply', 'SiN Gold', 'Turok', 'DOOM 64', 'Forsaken Remastered', 'Turok 2: Seeds of Evil',
    'PowerSlave Exhumed', 'Rise of the Triad: Ludicrous Edition', 'Turok 3: Shadow of Oblivion'] },
  { name: 'Talisman The Complete Collection Returns', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-05-24', price: null, games: [
    'Character Pack #1 - Exorcist', 'Character Pack #10 - Shaman', 'Character Pack #11 - Illusionist',
    'Character Pack #12 - Jester', 'Character Pack #13 - Goblin Shaman', 'Character Pack #14 - Martial Artist',
    'Character Pack #15 - Saracen', 'Character Pack #16 - Samurai', 'Character Pack #2 - Courtesan',
    "Character Pack #3 - Devil's Minion", 'Character Pack #4 - Genie', 'Character Pack #5 - Martyr',
    'Character Pack #6 - Gambler', 'Character Pack #7 - Black Witch', 'Character Pack #8 - Apprentice Mage',
    'Character Pack #9 - Shape Shifter'] },
  { name: "Let 'Em Cook", store: 'Humble Bundle', kind: 'bundle', date: '2024-05-29', price: null, games: [
    'Cafe Owner Simulator', 'Diner Bros', 'Epic Chef', 'PlateUp!', 'Chef : Full Menu', 'Cooking Simulator',
    'Cooking Simulator - Shelter', 'One-armed cook: Gourmet Upgrade', 'Sugar Shack'] },
  { name: 'Stories of Pride', store: 'Humble Bundle', kind: 'bundle', date: '2024-05-31', price: null, games: [
    'Heaven Will Be Mine', 'No Longer Home', 'The World Next Door', 'Arcadia Fallen',
    'Coffee Talk Episode 2: Hibiscus & Butterfly', 'Lakeburg Legacies',
    'Monster Camp Character Pack - Colorful Campers', 'Monster Camp: Camp Forever Bundle', 'Wylde Flowers'] },
  { name: 'Royalty-Free 001 Game Creator STEM Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-06-03', price: null, games: [
    '001 Game Creator', '001 Game Creator - 3D Step Dungeon Maze Kit', '001 Game Creator - Point & Click Adventure Kit',
    '001 Game Creator - Visual Novel Kit', 'E-Book - STEM Course for 001 Game Creator: Basics',
    'E-Book - STEM Course for 001 Game Creator: Resources'] },
  { name: 'June 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-06-04', price: null, games: [
    'A Guidebook Of Babel', 'Empyrion - Galactic Survival', 'Knights of Honor II: Sovereign',
    'LEGO® 2K Drive Awesome Edition', 'Risk of Rain 2', 'Stray Gods: The Roleplaying Musical',
    'Warhammer 40,000: Battlesector'] },
  { name: 'Playing for the Planet', store: 'Humble Bundle', kind: 'bundle', date: '2024-06-05', price: null, games: [
    'Never Alone Arctic Collection', 'Alba: A Wildlife Adventure', 'Before We Leave', 'Beyond Blue', 'Carto',
    'Gibbon: Beyond the Trees', 'Lake'] },
  { name: 'Future Games Show Discovery', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-06-06', price: null, games: [
    'Deliver Us Mars', 'En Garde!', 'Lost in Play', 'Ship of Fools', 'The Entropy Centre', 'American Arcadia',
    'Gloomwood'] },
  { name: 'IGN Live at Home', store: 'Humble Bundle', kind: 'bundle', date: '2024-06-07', price: null, games: [
    'Bread & Fred', 'Grindstone', 'MechWarrior 5: Mercenaries', 'Soulslinger: Envoy of Death',
    'Atari 50: The Anniversary Celebration', 'High On Life', 'Revival: Recolonization'] },
  { name: 'tinyBuild IGN Live Showcase', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-06-07', price: null, games: [
    'Graveyard Keeper', 'Hello Neighbor', 'Kill It With Fire', 'Nitro Kid', 'Party Hard 2', 'Streets of Rogue',
    'Graveyard Keeper - Stranger Sins', 'Not For Broadcast', 'Tinykin', 'Asterigos: Curse of the Stars',
    'Cartel Tycoon', 'Hello Neighbor 2', 'Not For Broadcast: Bits of Your Life', 'Not For Broadcast: Live & Spooky'] },
  { name: 'Outright Games: Outfits, Adventures, & Best Friends Forever', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-06-12', price: null, games: [
    'JoJo Siwa: Worldwide Party', 'L.O.L. Surprise! B.B.s BORN TO TRAVEL™', 'My Friend Peppa Pig',
    'Bratz™: Flaunt your fashion', 'MY LITTLE PONY: A Maretime Bay Adventure', 'Peppa Pig: World Adventures',
    'RAINBOW HIGH™: RUNWAY RUSH', 'Spirit'] },
  { name: 'Movavi & Easeus: Media Mastery Pack', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-06-13', price: null, games: [
    'Movavi Photo Editor 2024', 'Movavi Screen Recorder 2023', 'Movavi Video Editor 2023 - Action Pack',
    'Movavi Video Editor 2023 - Cinematic Set', 'Movavi Video Editor 2023 - Cyberpunk Overlay Pack',
    'Movavi Video Editor 2023 - Good Game Pack', "Movavi Video Editor 2023 - Let's Play Pack",
    'Movavi Video Editor 2023 - My Channel Pack for YouTube #2', 'Movavi Video Editor 2023 - Old Tape Overlay Pack',
    'Movavi Video Editor 2023 - Rule Your Game Music Pack', 'Movavi Video Editor 23'] },
  { name: 'The Upload VR Summer Showcase 2024: Devolver Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-06-21', price: null, games: [
    "Block'hood VR", 'GORN', 'Serious Sam 3 VR: BFE', 'Serious Sam VR: The First Encounter',
    'Serious Sam VR: The Last Hope', 'Serious Sam VR: The Second Encounter', 'Tentacular', 'The Talos Principle VR'] },
  { name: 'Summer Games Done Quick 2024', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-06-28', price: null, games: [
    'Blazing Chrome', 'Dishonored', 'Hyperbolica', 'Arzette: The Jewel of Faramore', 'The Elder Scrolls III: Morrowind',
    'Nickelodeon All-Star Brawl 2', 'Penny’s Big Breakaway'] },
  { name: 'July 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-07-02', price: null, games: [
    'A Plague Tale: Requiem', 'Figment 2: Creed Valley', 'Ghostrunner 2', "Heretic's Fork", 'HYPERVIOLENT',
    'Starship Troopers: Terran Command', 'Sticky Business'] },
  { name: 'The Many Worlds of Muv-Luv', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-07-03', price: null, games: [
    '[TDA00] Muv-Luv Unlimited: THE DAY AFTER - Episode 00 REMASTERED', 'Muv-Luv', 'Muv-Luv photonflowers*',
    '[TDA01] Muv-Luv Unlimited: THE DAY AFTER - Episode 01 REMASTERED',
    '[TDA02] Muv-Luv Unlimited: THE DAY AFTER - Episode 02 REMASTERED',
    '[TDA03] Muv-Luv Unlimited: THE DAY AFTER - Episode 03 REMASTERED', 'Muv-Luv photonmelodies♮',
    'Muv-Luv Alternative', 'The Imperial Capital Burns - Muv-Luv Alternative Total Eclipse',
    'Muv-Luv Alternative Total Eclipse'] },
  { name: 'Flashback Classics', store: 'Humble Bundle', kind: 'bundle', date: '2024-07-10', price: null, games: [
    'Super Meat Boy', 'VVVVVV', 'Epic Battle Fantasy Collection', 'Super Fancy Pants Adventure',
    'The Last Stand Legacy Collection', 'Worms W.M.D', 'Strike Force Heroes', 'Submachine: Legacy'] },
  { name: 'Summer Sims 2: astragon anthology', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-07-12', price: null, games: [
    'Construction-Simulator (2015) Deluxe Edition', 'TransOcean: The Shipping Company', 'ABRISS', 'Bus Simulator 18',
    'Bus Simulator 18 - MAN Bus Pack 1', 'Bus Simulator 18 - MAN Interior Pack 1',
    'Bus Simulator 18 - Mercedes-Benz Bus Pack 1', 'Bus Simulator 18 - Mercedes-Benz Interior Pack 1',
    'Bus Simulator 18 - Official map extension', 'Bus Simulator 18 - Setra Bus Pack 1', 'TransOcean 2: Rivals',
    'Bus Simulator 21 Next Stop', 'Firefighting Simulator - The Squad', 'Bus Simulator 21 Next Stop - Gold Upgrade',
    'Construction Simulator'] },
  { name: 'Management Material: Tropico & More from Kalypso', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-07-17', price: null, games: [
    'Tropico 3: Gold Edition', 'Port Royale 3 Gold', "Tropico 4 Collector's Bundle", 'Port Royale 4 - Extended Edition',
    'Spacebase Startopia', 'Tropico 5 - Complete Collection', 'Railway Empire', 'Railway Empire - Crossing the Andes',
    'Railway Empire - Down Under', 'Railway Empire - France', 'Railway Empire - Germany',
    'Railway Empire - Great Britain & Ireland', 'Railway Empire - Japan', 'Railway Empire - Mexico',
    'Railway Empire - Northern Europe', 'Railway Empire - The Great Lakes'] },
  { name: 'Pixels With Porpoise', store: 'Humble Bundle', kind: 'bundle', date: '2024-07-19', price: null, games: [
    'Celeste', 'TowerFall Ascension', 'TowerFall Dark World Expansion', 'Webbed', 'Anvil Saga',
    'Children of Morta: Complete Edition', "Hero's Hour", 'Rivals of Aether'] },
  { name: 'Gold Medal Games: Summer 2024', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-07-25', price: null, games: [
    'Descenders', 'Session: Skate Sim', 'NBA 2K24', 'PGA TOUR 2K23', 'Barton Lynch Pro Surfing',
    'Matchpoint - Tennis Championships', 'Skater XL'] },
  { name: 'LEGO Worlds Collide: The Ultimate Assembly', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-07-31', price: null, games: [
    'LEGO Batman: The Videogame', 'LEGO Harry Potter: Years 1-4', 'LEGO MARVEL Super Heroes',
    'LEGO The Lord of the Rings', 'The LEGO Movie - Videogame', "LEGO® MARVEL's Avengers",
    'LEGO Batman 2: DC Super Heroes', 'LEGO Harry Potter: Years 5-7', 'LEGO The Hobbit',
    'The LEGO NINJAGO Movie Video Game', 'LEGO Batman 3: Beyond Gotham', 'LEGO DC Super-Villains',
    'LEGO Jurassic World', 'LEGO MARVEL Super Heroes 2', 'LEGO STAR WARS: The Force Awakens', 'LEGO The Incredibles'] },
  { name: 'Board Game Night with Dire Wolf & Friends', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-08-02', price: null, games: [
    'Root', 'Sagrada', 'Scythe: Digital Edition', 'Munchkin Digital', 'Wingspan', 'Everdell', 'Terraforming Mars',
    'Terraforming Mars - Hellas & Elysium', 'Terraforming Mars - Prelude', 'Dune: Imperium',
    'Quilts and Cats of Calico'] },
  { name: 'August 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-08-06', price: null, games: [
    'Astral Ascent', 'BLACKTAIL', 'Gotham Knights', 'High On Life', 'Sifu', 'This Means Warp'] },
  { name: 'Capcom Summer 2024', store: 'Humble Bundle', kind: 'bundle', date: '2024-08-07', price: null, games: [
    'Dead Rising 2', 'Dead Rising 2: Off the Record', "Dragon's Dogma: Dark Arisen", 'Dead Rising 3',
    'Street Fighter 30th Anniversary Collection', 'Street Fighter V - Champion Edition', "Capcom Beat 'Em Up Bundle",
    "Dead Rising 4: Frank's Big Package", 'Phoenix Wright: Ace Attorney Trilogy', 'Capcom Fighting Collection',
    'Ghost Trick: Phantom Detective', 'The Great Ace Attorney Chronicles'] },
  { name: 'The Great Escape Room Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-08-09', price: null, games: [
    'We Were Here Expeditions: The FriendShip', 'Escape First Alchemist', 'Doors: Paradox', 'Escape Academy',
    'Escape From Mystwood Mansion', 'Escape Simulator', 'We Were Here Forever'] },
  { name: 'Beamdog & Owlcat: RPG Masters', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-08-14', price: null, games: [
    'Icewind Dale: Enhanced Edition', 'Planescape: Torment: Enhanced Edition', "Baldur's Gate II: Enhanced Edition",
    "Baldur's Gate: Enhanced Edition", "Baldur's Gate: Faces of Good and Evil", "Baldur's Gate: Siege of Dragonspear",
    'Pathfinder: Kingmaker — Enhanced Plus Edition', 'Neverwinter Nights: Enhanced Edition',
    'Neverwinter Nights: Enhanced Edition Dark Dreams of Furiae',
    'Neverwinter Nights: Enhanced Edition Darkness Over Daggerford',
    'Neverwinter Nights: Enhanced Edition Infinite Dungeons',
    'Neverwinter Nights: Enhanced Edition Pirates of the Sword Coast',
    'Neverwinter Nights: Enhanced Edition Tyrants of the Moonsea',
    'Neverwinter Nights: Enhanced Edition Wyvern Crown of Cormyr',
    'Pathfinder: Wrath of the Righteous - Enhanced Edition', 'Pathfinder: Kingmaker - Season Pass'] },
  { name: 'Tower Defense', store: 'Humble Bundle', kind: 'bundle', date: '2024-08-16', price: null, games: [
    'GemCraft - Chasing Shadows', 'Element TD 2', 'Exodus Borealis', 'Kingdom Rush Vengeance', 'Necrosmith 2',
    'Diplomacy is Not an Option', 'Isle of Arrows', 'Paper Planet'] },
  { name: 'Resident Evil: Decades of Horror - Village Gold', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-08-21', price: null, games: [
    'Resident Evil', 'Resident Evil Revelations', 'Resident Evil Revelations 2', 'Resident Evil 0',
    'Resident Evil 4 (2005)', 'Resident Evil 5 Gold Edition', 'Resident Evil 6 Complete',
    'Resident Evil Revelations 2 / Biohazard Revelations 2 Deluxe Edition', 'Resident Evil 2', 'Resident Evil 3',
    'Resident Evil 7 Biohazard', 'Resident Evil Village Gold Edition'] },
  { name: 'Humble Detectives Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2024-08-23', price: null, games: [
    'Call of Cthulhu', 'IMMORTALITY', 'Killer Frequency', 'Overboard!', 'Paradise Killer', 'The Darkside Detective',
    'The Darkside Detective: A Fumble in the Dark'] },
  { name: 'Gotcha Gotcha presents: The Ultimate RPG Maker Experience', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-08-30', price: null, games: [
    'Pixel Game Maker MV', 'Pixel Game Maker MV - Cardgame Sample',
    'Pixel Game Maker MV - Weapon assets (100 varieties) and Dot Robot Set',
    'Pixel Game Maker MV -2D Side-scroller Shooting Game Sample Project', 'RPG Maker VX Ace',
    'RPG Maker VX Ace - DS+ Resource Pack', 'RPG Maker XP', 'RPG Maker MV', 'RPG Maker MV - DS+ Resource Pack',
    'RPG Maker MV - GENE', 'RPG Maker MV - MADO', 'RPG Maker MV - SAKAN', 'RPG Maker MZ',
    'RPG Maker MZ - 3D Particle Effect Pack', 'RPG Maker MZ - Character Generator Pack',
    'RPG Maker MZ - DorapixelMapChips - Modern JP'] },
  { name: 'September 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-09-03', price: null, games: [
    'Coral Island', 'InfraSpace', 'Lost Eidolons', "Marvel's Guardians of the Galaxy",
    'SpongeBob SquarePants: The Cosmic Shake', 'You Suck at Parking® - Complete Edition'] },
  { name: 'Summer Narrative Celebration Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-09-04', price: null, games: [
    'Death and Taxes', 'Genesis Noir', 'Suzerain', 'Do Not Feed the Monkeys 2099', 'The Pale Beyond', 'A Highland Song',
    'A Space for the Unbound'] },
  { name: 'Steamier Sakura Special', store: 'Humble Bundle', kind: 'bundle', date: '2024-09-11', price: null, games: [
    'Sakura Alien', 'Sakura Dungeon', 'Sakura Forest Girls', 'Sakura Forest Girls 2', 'Sakura Forest Girls 3',
    'Sakura Knight', 'Sakura Knight 2', 'Sakura Knight 3', 'Sakura MMO', 'Sakura MMO 2', 'Sakura MMO 3',
    'Sakura MMO Extra', 'Sakura Succubus', 'Sakura Succubus 2', 'Sakura Succubus 3', 'Sakura Succubus 4'] },
  { name: 'Rhythm is Gonna Get You VR Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-09-13', price: null, games: [
    'Spin Rhythm XD', 'Thumper', 'Drums Rock', 'PowerBeatsVR', 'Ragnarock', 'Audio Trip', 'Pistol Whip',
    'Synth Riders'] },
  { name: 'indie.io Super Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2024-09-18', price: null, games: [
    'Blood And Zombies', 'Coromon', 'Dark Deity', 'LunarLux', 'To The Rescue!', 'Airborne Kingdom', 'Cat Cafe Manager',
    'One Lonely Outpost', 'Symphony of War: The Nephilim Saga', 'Airship: Kingdoms Adrift', 'Dream Tactics',
    'Sands of Aura', 'Voltaire - The Vegan Vampire'] },
  { name: 'One Special Bundle: The Legacy of adult swim games', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-09-20', price: null, games: [
    'Battle Chef Brigade', 'Duck Game', "Jazzpunk: Director's Cut", 'Pool Panic', 'Rain World',
    "Death's Gambit: Afterlife", "Death's Gambit: Afterlife - Ashes of Vados", 'Rain World: Downpour',
    'Samurai Jack: Battle Through Time'] },
  { name: 'Enter the Mysterium', store: 'Humble Bundle', kind: 'bundle', date: '2024-09-25', price: null, games: [
    'Cosmic Osmo', 'Manhole', 'Spelunx', 'Myst V', 'Riven (1997)', 'Uru: Complete Chronicles', 'Myst IV: Revelation',
    'Myst: Masterpiece Edition', 'Myst III: Exile', 'Obduction', 'realMyst: Masterpiece Edition', 'Firmament',
    'Myst'] },
  { name: 'Jurassic World Evolution Completionist Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-09-27', price: null, games: [
    'Jurassic World Evolution', 'Jurassic World Evolution: Carnivore Dinosaur Pack',
    'Jurassic World Evolution: Cretaceous Dinosaur Pack', 'Jurassic World Evolution: Herbivore Dinosaur Pack',
    'Jurassic World Evolution: Raptor Squad Skin Collection', 'Jurassic World Evolution - Deluxe DLC',
    'Jurassic World Evolution 2', "Jurassic World Evolution: Claire's Sanctuary",
    'Jurassic World Evolution: Return To Jurassic Park', 'Jurassic World Evolution: Secrets of Dr Wu',
    'Jurassic World Evolution 2: Camp Cretaceous Dinosaur Pack', 'Jurassic World Evolution 2: Cretaceous Predator Pack',
    'Jurassic World Evolution 2: Early Cretaceous Pack', 'Jurassic World Evolution 2: Feathered Species Pack',
    'Jurassic World Evolution 2: Late Cretaceous Pack',
    'Jurassic World Evolution 2: Prehistoric Marine Species Pack'] },
  { name: 'October 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-10-01', price: null, games: [
    'Jusant', 'McPixel 3', 'Persona 5 Strikers', 'Remnant II', 'Remnant Records', 'Station to Station'] },
  { name: 'Have a Warhammer Day', store: 'Humble Bundle', kind: 'bundle', date: '2024-10-02', price: null, games: [
    'Warhammer 40,000: Dakka Squadron - Flyboyz Edition', 'Warhammer 40,000: Inquisitor - Prophecy',
    'Warhammer 40,000: Inquisitor - Martyr', 'Warhammer 40,000: Shootas, Blood & Teef',
    'Warhammer 40,000: Battlesector', 'Warhammer 40,000: Chaos Gate - Daemonhunters',
    'Warhammer Age of Sigmar: Realms of Ruin Ultimate Edition'] },
  { name: "Twin Stick 'Em Up", store: 'Humble Bundle', kind: 'bundle', date: '2024-10-04', price: null, games: [
    'Lone Ruin', 'RUINER', 'Windowkill', 'Go Mecha Ball', 'OTXO', 'The Ascent: Cyber Edition',
    'The Last Stand: Aftermath'] },
  { name: 'Madcap Multiplayer Missions', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-10-11', price: null, games: [
    'First Class Trouble', 'Murky Divers', 'Perfect Heist 2', 'Blazing Sails', 'The Greatest Penguin Heist of All Time',
    'Tower Unite', 'The Break-In'] },
  { name: 'Atari: Recharged Retro Revival', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-10-18', price: null, games: [
    'Asteroids: Recharged', 'Black Widow: Recharged', 'Centipede: Recharged', 'Breakout: Recharged',
    'Gravitar: Recharged', 'Missile Command: Recharged', 'Yars: Recharged', 'Berzerk: Recharged',
    'Caverns of Mars: Recharged', 'Quantum: Recharged', 'Atari 50: The Anniversary Celebration'] },
  { name: 'Microids Mystery Menagerie', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-10-23', price: null, games: [
    'Nostradamus: The Last Prophecy', 'Post Mortem', 'Sinking Island', 'Still Life', 'Still Life 2',
    'Agatha Christie - The ABC Murders', 'Murder Mystery Machine', 'Syberia 1+2+3', 'Yesterday Origins',
    'Agatha Christie - Hercule Poirot: The First Cases', 'Alfred Hitchcock - Vertigo', 'Blacksad: Under the Skin',
    'Agatha Christie - Hercule Poirot: The London Case', 'Syberia - The World Before',
    'Agatha Christie - Murder on the Orient Express'] },
  { name: 'House Flipper Humble Bundle 2024', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-10-25', price: null, games: [
    'House Flipper', 'House Flipper VR', 'House Flipper - Farm DLC', 'House Flipper - HGTV DLC',
    'House Flipper - Luxury DLC', 'House Flipper - Pop Art Furniture Pack', 'House Flipper - Pets DLC',
    'House Flipper Pets VR'] },
  { name: 'Dark Pictures and Little Nightmares: A Halloween Horror Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-10-30', price: null, games: [
    'Little Nightmares', 'The Dark Pictures Anthology: Man of Medan',
    'Little Nightmares - Secrets of The Maw Expansion Pass', 'The Dark Pictures Anthology: Little Hope',
    'Little Nightmares II - Deluxe Edition', 'The Dark Pictures Anthology: House of Ashes',
    'The Dark Pictures Anthology: The Devil in Me'] },
  { name: 'Generation Zero: The Ultimate Resistance', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-11-01', price: null, games: [
    'Generation Zero®', 'Generation Zero® - Schweet Vanity Pack', 'Generation Zero® - Soviet Weapons Pack',
    'Generation Zero® - US Weapons Pack', 'Generation Zero® - US Weapons Pack 2',
    'Generation Zero® - Advanced Intelligence Cosmetics Pack', 'Generation Zero® - Base Defense Pack',
    'Generation Zero® - Base Support Pack', 'Generation Zero® - Camo Weapon Skins Pack',
    'Generation Zero® - Eastern European Weapons Pack', 'Generation Zero® - Resistance Weapons Pack',
    'Generation Zero® - Tactical Equipment Pack', 'Generation Zero® - Alpine Unrest',
    'Generation Zero® - Companion Accessories Pack', 'Generation Zero® - FNIX Rising',
    'Generation Zero® - Heavy Weapons Pack'] },
  { name: 'November 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-11-05', price: null, games: [
    'Cassette Beasts', 'Garden Life: A Cozy Simulator', 'Hexarchy', 'KarmaZoo', 'Persona 4 Golden', 'The Bookwalker',
    'Warhammer 40,000: Darktide'] },
  { name: '2K Presents: The Sid Meier Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-11-08', price: null, games: [
    "Sid Meier's Ace Patrol", "Sid Meier's Ace Patrol: Pacific Skies", "Sid Meier's Civilization III: Complete",
    "Sid Meier's Railroads!", "Sid Meier's Starships", 'Civilization: Beyond Earth – The Collection',
    "Sid Meier's Civilization IV: The Complete Edition", "Sid Meier's Civilization V: Complete Edition",
    "Sid Meier's Civilization VI", "Sid Meier's Pirates!",
    "Sid Meier's Civilization® VI: Australia Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Gathering Storm",
    "Sid Meier's Civilization® VI: Khmer and Indonesia Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Nubia Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Persia and Macedon Civilization & Scenario Pack",
    "Sid Meier's Civilization® VI: Poland Civilization & Scenario Pack"] },
  { name: "Let's Get Tactical with Kalypso", store: 'Humble Bundle', kind: 'bundle',
    date: '2024-11-13', price: null, games: [
    'Sudden Strike 2 Gold', 'Sudden Strike 3', 'Sudden Strike Gold', 'Commandos: Behind Enemy Lines', 'Dungeons',
    'Dungeons - Into the Dark', 'Dungeons - Map Pack', 'Dungeons - The Dark Lord', 'Commandos 2 - HD Remaster',
    'Dungeons 2', 'Dungeons 2 - A Chance of Dragons', 'Dungeons 2 - A Game of Winter',
    'Dungeons 2 - A Song of Sand and Fire', 'Praetorians - HD Remaster', 'Sudden Strike 4',
    'Commandos 3 - HD Remaster'] },
  { name: 'The Telltale Collection (Nov 2024)', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-11-15', price: null, games: [
    'Batman - The Enemy Within Shadows Mode', 'Batman - The Telltale Series',
    'Batman - The Telltale Series Shadows Mode', 'Batman: The Enemy Within - The Telltale Series',
    'Tales of Monkey Island Complete Pack', 'The Wolf Among Us', 'The Expanse: A Telltale Series',
    'The Walking Dead: The Telltale Definitive Series'] },
  { name: 'Sci-Fi Shooters', store: 'Humble Bundle', kind: 'bundle', date: '2024-11-22', price: null, games: [
    'Crysis Remastered', 'DOOM', 'Crysis 2 Remastered', 'Prey', 'Crysis 3 Remastered',
    'STAR WARS™: Dark Forces Remaster', 'System Shock'] },
  { name: 'Rawcember to Remember', store: 'Humble Bundle', kind: 'bundle', date: '2024-11-27', price: null, games: [
    'Friends vs Friends', 'Kingdom Two Crowns', 'Pizza Possum', 'Star Renegades', 'Kingdom Eighties',
    'Kingdom Two Crowns: Norse Lands', "Mr. Sun's Hatbox", 'NORCO', 'Sable', 'Dome Keeper Deluxe Edition',
    'SKALD: Against the Black Priory', 'Snufkin: Melody of Moominvalley'] },
  { name: 'Disney Classics Black Friday Humble Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-11-29', price: null, games: [
    "Indiana Jones® and the Emperor's Tomb™", 'LEGO Indiana Jones 2: The Adventure Continues',
    'LEGO Pirates of the Caribbean The Video Game', 'LEGO Star Wars III: The Clone Wars',
    'LEGO Star Wars: The Complete Saga', 'LEGOⓇ Indiana Jones: The Original Adventures',
    'Monkey Island 2: Special Edition', 'STAR WARS Empire at War: Gold Pack', 'STAR WARS Galactic Battlegrounds Saga',
    'STAR WARS Jedi Knight: Jedi Academy', 'STAR WARS Knights of the Old Republic II: The Sith Lords',
    'STAR WARS Rebellion', 'STAR WARS Republic Commando', 'STAR WARS: The Force Unleashed Ultimate Sith Edition',
    'STAR WARS™ Knights of the Old Republic™', 'The Curse of Monkey Island'] },
  { name: 'December 2024 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2024-12-03', price: null, games: [
    'Atlas Fallen', 'Bomb Rush Cyberfunk', 'Crime Boss: Rockay City - (First Month Edition)', 'Inkulinati',
    'Monster Prom 3: Monster Roadtrip', 'Old World', 'The Invincible', 'Venba'] },
  { name: 'Wholesome Snack 2024', store: 'Humble Bundle', kind: 'bundle', date: '2024-12-04', price: null, games: [
    'Minami Lane', "Rusty's Retirement", 'Spirit City: Lofi Sessions', 'Fae Farm', 'Fae Farm - Original Soundtrack',
    'Little Kitty, Big City', 'The Ranch of Rivershine'] },
  { name: 'LEGO Worlds Collide: The Ultimate Assembly Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-12-06', price: null, games: [
    "LEGO® MARVEL's Avengers", 'LEGO Batman 2: DC Super Heroes', 'LEGO Batman 3: Beyond Gotham',
    'LEGO Batman: The Videogame', 'LEGO DC Super-Villains', 'LEGO Harry Potter: Years 1-4',
    'LEGO Harry Potter: Years 5-7', 'LEGO Jurassic World', 'LEGO MARVEL Super Heroes', 'LEGO MARVEL Super Heroes 2',
    'LEGO STAR WARS: The Force Awakens', 'LEGO The Hobbit', 'LEGO The Incredibles', 'LEGO The Lord of the Rings',
    'LEGO Worlds', 'The LEGO Movie - Videogame'] },
  { name: 'Back with a Vengeance: The Best of Boomer Shooters Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-12-07', price: null, games: [
    'Deadlink', 'Forgive Me Father 2', 'POSTAL: Brain Damaged - Connoisseur Edition', 'Prodeus', 'Quake II',
    'Turbo Overkill', 'ULTRAKILL'] },
  { name: 'Board Game Night with Dire Wolf & Friends Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-12-08', price: null, games: [
    'Dune: Imperium', 'Everdell', 'Munchkin Digital', 'Quilts and Cats of Calico', 'Root', 'Sagrada',
    'Scythe: Digital Edition', 'Terraforming Mars', 'Terraforming Mars - Hellas & Elysium',
    'Terraforming Mars - Prelude', 'Wingspan'] },
  { name: 'Beamdog & Owlcat: RPG Masters Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-12-09', price: null, games: [
    "Baldur's Gate II: Enhanced Edition", "Baldur's Gate: Enhanced Edition", "Baldur's Gate: Faces of Good and Evil",
    "Baldur's Gate: Siege of Dragonspear", 'Icewind Dale: Enhanced Edition', 'Neverwinter Nights: Enhanced Edition',
    'Neverwinter Nights: Enhanced Edition Dark Dreams of Furiae',
    'Neverwinter Nights: Enhanced Edition Darkness Over Daggerford',
    'Neverwinter Nights: Enhanced Edition Infinite Dungeons',
    'Neverwinter Nights: Enhanced Edition Pirates of the Sword Coast',
    'Neverwinter Nights: Enhanced Edition Tyrants of the Moonsea',
    'Neverwinter Nights: Enhanced Edition Wyvern Crown of Cormyr', 'Pathfinder: Kingmaker - Season Pass',
    'Pathfinder: Kingmaker — Enhanced Plus Edition', 'Pathfinder: Wrath of the Righteous - Enhanced Edition',
    'Pathfinder: Wrath of the Righteous – Season Pass'] },
  { name: 'tinyBuild IGN Live Showcase Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-12-10', price: null, games: [
    'Asterigos: Curse of the Stars', 'Cartel Tycoon', 'Graveyard Keeper', 'Graveyard Keeper - Stranger Sins',
    'Hello Neighbor', 'Hello Neighbor 2', 'Kill It With Fire', 'Nitro Kid', 'Not For Broadcast',
    'Not For Broadcast: Bits of Your Life', 'Not For Broadcast: Live & Spooky', 'Party Hard 2', 'Streets of Rogue',
    'Tinykin'] },
  { name: 'Devious Deckbuilders Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-12-11', price: null, games: [
    'Astrea: Six-Sided Oracles', 'Book of Hours', 'Dungeon Drafters', 'Floppy Knights', 'Gordian Quest',
    'Mahokenshi - The Samurai Deckbuilder', 'Zoeti'] },
  { name: 'Metroidvania Mania Encore', store: 'Humble Bundle', kind: 'bundle', date: '2024-12-12', price: null, games: [
    '9 Years of Shadows', 'Axiom Verge', 'Axiom Verge 2', 'Cookie Cutter', "Death's Gambit: Afterlife", 'Ghost Song',
    'The Knight Witch'] },
  { name: 'Future Games Show Discovery Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-12-13', price: null, games: [
    'American Arcadia', 'Deliver Us Mars', 'En Garde!', 'Gloomwood', 'Lost in Play', 'Ship of Fools',
    'The Entropy Centre'] },
  { name: 'Humble Heroines: Action, Adventure, & Intrigue Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-12-14', price: null, games: [
    'A Plague Tale: Innocence', 'Chorus', 'Eastward', 'LISA: Complete Edition', 'Metal: Hellsinger', 'Scars Above',
    'Wanted: Dead'] },
  { name: 'Mind-Bending Masterpieces Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2024-12-15', price: null, games: [
    'Doors: Paradox', 'Manifold Garden', "Patrick's Parabox", 'Superliminal', 'Taiji', 'The Pedestrian',
    'The Witness'] },
  { name: 'Spring Screams Encore', store: 'Humble Bundle', kind: 'bundle', date: '2024-12-16', price: null, games: [
    'Amnesia: The Bunker', 'DEVOUR', 'Escape the Backrooms', 'FOREWARNED', 'Killer Frequency',
    'My Friendly Neighborhood', 'The Quarry'] },
  { name: 'New Year, New You: Communication & Meditation', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-01-01', price: null, games: [
    'Epistory - Typing Chronicles', 'Influent', 'Nanotale - Typing Chronicles', 'PLAYNE', 'Terra Alia',
    'The Textorcist: The Story of Ray Bibbia', 'You Can Kana'] },
  { name: 'Speedrunning with Awesome GDQ', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-01-03', price: null, games: [
    'BPM: BULLETS PER MINUTE', 'Condemned: Criminal Origins', 'Have a Nice Death', "New Super Lucky's Tale",
    'Ori and the Blind Forest: Definitive Edition', 'Shenmue I & II', 'Sonic Lost World'] },
  { name: 'January 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-01-07', price: null, games: [
    'Against the Storm', 'Beneath Oresa', 'Blasphemous 2', 'Boxes', 'Dordogne', 'Jagged Alliance 3'] },
  { name: 'New Year, New You: Programming Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-01-08', price: null, games: [
    '7 Billion Humans', 'EXAPUNKS', 'Human Resource Machine', 'Learning Factory', 'SHENZHEN I/O', 'TIS-100',
    'while True: learn()'] },
  { name: 'Monster Hunter New Year Hunting Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-01-10', price: null, games: [
    'MONSTER HUNTER RISE', 'MONSTER HUNTER RISE Deluxe Kit', 'Monster Hunter Rise: Sunbreak',
    'Monster Hunter Rise: Sunbreak Deluxe Kit', 'Monster Hunter: World', 'Monster Hunter: World - Deluxe Kit',
    'Monster Hunter World: Iceborne', 'Monster Hunter World: Iceborne Deluxe Kit'] },
  { name: 'Nacon Motorsports: Drive & Thrive', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-01-15', price: null, games: [
    'Truck Racer', 'FIA European Truck Racing Championship', 'TT Isle of Man: Ride on the Edge', 'V-Rally 4', 'WRC 7',
    'Monster Truck Championship', 'TT Isle of Man: Ride on the Edge 2', 'WRC 8 FIA World Rally Championship',
    'Overpass 2', 'TT Isle Of Man: Ride on the Edge 3', 'WRC Generations - The FIA WRC Official Game'] },
  { name: 'February 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-02-04', price: null, games: [
    'Fabledom', 'Griftlands', 'My Little Universe', "Naheulbeuk's Dungeon Master", 'Nested Lands Playtest',
    'Tales And Tactics', 'Total War: PHARAOH', 'Trepang2'] },
  { name: 'Destiny 2: The Story So Far (Feb 2025)', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-02-05', price: null, games: [
    'Destiny 2: Beyond Light Pack', 'Destiny 2: Forsaken Pack', 'Destiny 2: Shadowkeep Pack',
    'Destiny 2: Bungie 30th Anniversary Pack', 'Destiny 2: Lightfall', 'Destiny 2: The Witch Queen',
    'Destiny 2: The Final Shape', 'Destiny 2: The Final Shape + Annual Pass'] },
  { name: 'Better With a Friend: Co-op Adventures', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-02-07', price: null, games: [
    'Cat Quest II', 'For The King - Deluxe Edition', 'Tribes of Midgard', 'Across the Obelisk', 'Risk of Rain Returns',
    'Trine 4: The Nightmare Prince'] },
  { name: 'Capcom Arcade Classics & Fighters Pack', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-02-12', price: null, games: [
    'Capcom Arcade 2nd Stadium Bundle', 'Capcom Arcade Stadium Packs 1, 2, and 3',
    'Street Fighter 30th Anniversary Collection', 'Street Fighter V - Champion Edition', 'Ultra Street Fighter IV'] },
  { name: 'Humble RPG Bundle: Pathfinder Kingmaker Bundle from Paizo Inc.', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-02-13', price: null, games: [
    'Pathfinder: Kingmaker — Enhanced Plus Edition'] },
  { name: 'Deckbuilder Bonanza', store: 'Humble Bundle', kind: 'bundle', date: '2025-02-14', price: null, games: [
    'Ash of Gods: The Way', 'Death Roads: Tournament', 'Backpack Hero', 'Hadean Tactics',
    'Fights in Tight Spaces Complete Edition', 'HELLCARD'] },
  { name: 'House Flipper and Friends Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-02-19', price: null, games: [
    'House Flipper', 'House Flipper - Party Furniture Pack', 'Train Station Renovation',
    'Train Station Renovation - Germany DLC', 'Builder Simulator', 'Builder Simulator VR', 'Hairdresser Simulator',
    'Hairdresser Simulator - Long Hair DLC', 'House Flipper - Garden DLC', 'The Tenants', 'The Tenants - Pets DLC',
    'Chornobyl Liquidators', 'Chornobyl Liquidators - Supporter Pack', 'House Flipper - Pets DLC',
    'Train Yard Builder'] },
  { name: 'Indie Allies 2025', store: 'Humble Bundle', kind: 'bundle', date: '2025-02-25', price: null, games: [
    'Aerial_Knights Never Yield', 'Elemental Survivors', 'Illuminaria', 'Innchanted', 'On the Peril of Parrots',
    'Princess Farmer', 'Raptor Boyfriend', 'Skator Gator', 'Skator Gator 3D', 'Super Space Club'] },
  { name: 'March 2025 Humble Choice ­', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-03-04', price: null, games: [
    'Cavern of Dreams', 'Gravity Circuit', 'Homeworld 3', 'Pacific Drive Deluxe Edition',
    'Sir Whoopass™: Immortal Death'] },
  { name: 'Fulqrum Publishing Spring Break', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-03-14', price: null, games: [
    'Stygian: Reign of the Old Ones', 'Through the Woods', 'Dread Templar', "Fell Seal: Arbiter's Mark",
    'WRATH: Aeon of Ruin', 'Forgive Me Father', 'Viscerafest'] },
  { name: 'HeroCraft PC Complete', store: 'Humble Bundle', kind: 'bundle', date: '2025-03-19', price: null, games: [
    'FootLOL: Epic Soccer League', 'King of Dragon Pass', 'Gravewood High - Complete package', 'INSOMNIA: The Ark',
    'Odysseus Kosmos and his Robot Quest: Adventure Game', 'Organs Please', 'Tempest: Complete Edition', 'Anvil Saga',
    'Catizens', 'Deck of Souls', 'Revival: Recolonization'] },
  { name: 'Humble Heroines 2025 (Mar 2025)', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-03-19', price: null, games: [
    'Kill The Crows', 'Pseudoregalia', 'Thief of Thieves: Season One', 'Beyond: Two Souls', 'Control Ultimate Edition',
    'Darksiders III', 'Pathfinder: Wrath of the Righteous - Enhanced Edition'] },
  { name: 'EARTH DEFENSE FORCE Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-03-21', price: null, games: [
    'EARTH DEFENSE FORCE 4.1  The Shadow of New Despair', 'EARTH DEFENSE FORCE 4.1  WINGDIVER THE SHOOTER',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: BM03 Vegalta Gold',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Depth Crawler Gold Coat',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus DCC-Gogo. Marking',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus DCC-Zero Marking',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus Tank, Bullet Girls Marking',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus Tank, EDF IFPS Markings',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Gigantus Tank, Natsuiro HS Markings',
    'EARTH DEFENSE FORCE 4.1 - Air Raider Weapons: Pure Decoy Launcher 5 Pack B [Seira] [Miyabi] [Noko] [Mitsuki] [Anju]',
    'EARTH DEFENSE FORCE 4.1 - Fencer Weapons: Blood Storm', 'EARTH DEFENSE FORCE 4.1 - Fencer Weapons: Ifrit',
    'EARTH DEFENSE FORCE 4.1 - Mission Pack 1: Time of the Mutants',
    'EARTH DEFENSE FORCE 4.1 - Mission Pack 2: Extreme Battle',
    'EARTH DEFENSE FORCE 4.1 - Ranger Weapons: Pure Decoy Launcher 5 Pack A [Karia] [Moegi] [Chiri] [Ouka] [Rinrin]',
    'EARTH DEFENSE FORCE 4.1 - Ranger Weapons: Sting Shot'] },
  { name: 'Leisure Suit Larry Complete Collection Bundle 2025', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-03-25', price: null, games: [
    'Leisure Suit Larry - Magna Cum Laude Uncut and Uncensored', "Leisure Suit Larry - Wet Dreams Don't Dry",
    "Leisure Suit Larry - Wet Dreams Don't Dry Artbook", "Leisure Suit Larry - Wet Dreams Don't Dry Soundtrack",
    'Leisure Suit Larry - Wet Dreams Dry Twice', 'Leisure Suit Larry 1 - In the Land of the Lounge Lizards',
    'Leisure Suit Larry 2 - Looking For Love (In Several Wrong Places)',
    'Leisure Suit Larry 3 - Passionate Patti in Pursuit of the Pulsating Pectorals',
    'Leisure Suit Larry 5 - Passionate Patti Does a Little Undercover Work',
    'Leisure Suit Larry 6 - Shape Up Or Slip Out', 'Leisure Suit Larry 7 - Love for Sail'] },
  { name: 'Dice and Destiny', store: 'Humble Bundle', kind: 'bundle', date: '2025-03-26', price: null, games: [
    'Disco Elysium', 'Pillars of Eternity - Definitive Edition', 'Roadwarden', 'Citizen Sleeper',
    'Pillars of Eternity II: Deadfire - Obsidian Edition', 'Broken Roads'] },
  { name: 'Tactical Triumph', store: 'Humble Bundle', kind: 'bundle', date: '2025-03-26', price: null, games: [
    'Abalon', 'Dungeon Drafters', 'Fae Tactics', 'Pawnbarian', 'Popup Dungeon', 'Siralim Ultimate', 'The Iron Oath'] },
  { name: 'Best of Boomer Shooters 4: Badda Bing Badda Boom', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-03-28', price: null, games: [
    'Deadlink', 'Forgive Me Father 2', 'GRAVEN', 'Necromunda: Hired Gun', 'PowerSlave Exhumed',
    'Serious Sam: Siberian Mayhem', 'Turbo Overkill'] },
  { name: 'Outright Games Game On! Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-03-28', price: null, games: [
    'Gigantosaurus: Dino Sports', 'Nick Jr. Party Adventure', 'PAW Patrol The Movie: Adventure City Calls',
    'Matchbox™ Driving Adventures', 'My Little Pony: A Zephyr Heights Mystery', 'TRANSFORMERS: Galactic Trials',
    'Barbie Project Friendship™', 'Bluey: The Videogame', 'PAW Patrol World'] },
  { name: 'April 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-04-01', price: null, games: [
    '1000xRESIST', 'Aliens: Dark Descent', 'Distant Worlds 2', 'DREDGE', 'Nomad Survival', 'Nova Lands',
    'Tomb Raider I-III Remastered Starring Lara Croft'] },
  { name: 'Fellow Traveller Publisher Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-04-02', price: null, games: [
    'The Invisible Hand', 'The Stillness of the Wind', 'Genesis Noir', 'In Other Waters', 'Kraken Academy!!',
    'Pine: A Story of Loss', 'The Pale Beyond', 'Times and Galaxy'] },
  { name: 'Armor Games Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-04-04', price: null, games: [
    "Don't Escape: 4 Days to Survive", 'LumbearJack', 'SOLAS 128', 'Bear and Breakfast', 'Sonny Legacy Collection',
    'Swords & Souls: Neverseen', 'The Tartarus Key', 'Baladins', 'In Stars And Time', 'Kamaeru: A Frog Refuge'] },
  { name: 'Neon Lights', store: 'Humble Bundle', kind: 'bundle', date: '2025-04-09', price: null, games: [
    "Black Future '88", 'Neon Abyss', 'The Red Strings Club', 'Ghostrunner', 'RKGK / Rakugaki', 'ANNO:Mutationem',
    'Neon Blood', 'Showgunners'] },
  { name: 'Train Sim World 5: Route Remix Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-04-11', price: null, games: [
    'Train Sim World® 5: Route Remix Bundle - Tier 1', 'Train Sim World® 5: Route Remix Bundle - Tier 2',
    'Train Sim World® 5: Route Remix Bundle - Tier 3'] },
  { name: 'Return to Metroidvania', store: 'Humble Bundle', kind: 'bundle', date: '2025-04-16', price: null, games: [
    'Gato Roboto', 'Monster Sanctuary', 'Astalon: Tears of the Earth', 'Islets', 'Shantae and the Seven Sirens',
    'Berserk Boy', 'BioGun', 'GRIME'] },
  { name: 'Doom and Wolfenstein MAYhem Bundle (previously known as: id and Friends Bundle)', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-04-23', price: null, games: [
    'DOOM 3: BFG Edition', 'DOOM 64', 'DOOM', 'DOOM + DOOM II', 'Wolfenstein: The New Order',
    'Wolfenstein: The Old Blood', 'Wolfenstein: Youngblood', 'DOOM Eternal', 'DOOM Eternal Year One Pass', 'DOOM VFR',
    'Wolfenstein II: The New Colossus', 'Wolfenstein: Cyberpilot'] },
  { name: 'Play for Miracles with Twin Sails Interactive', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-04-25', price: null, games: [
    'Agricola: All Creatures Big and Small', 'Amberial Dreams', 'Blood Rage: Digital Edition', 'Innchanted',
    'Isle of Skye', 'Splendor', 'Splendor - The Cities', 'Splendor - The Strongholds', 'Splendor - The Trading Posts',
    'The Lord of the Rings: Adventure Card Game - Definitive Edition', 'A Game Of Thrones - A Dance With Dragons',
    'A Game Of Thrones - A Feast For Crows', 'A Game of Thrones: The Board Game', "Arkham Horror: Mother's Embrace",
    'Blood Rage: Digital Edition - Gods of Asgard', 'Blood Rage: Digital Edition - Mystics of Midgard'] },
  { name: 'XCOM Complete', store: 'Humble Bundle', kind: 'bundle', date: '2025-04-29', price: null, games: [
    'X-COM: Apocalypse', 'X-COM: Enforcer', 'X-COM: Interceptor', 'X-COM: Terror from the Deep', 'X-COM: UFO Defense',
    'The Bureau: XCOM Declassified', 'XCOM: Enemy Unknown', 'XCOM: Enemy Unknown: Slingshot DLC', 'XCOM: Enemy Within',
    'XCOM 2', 'XCOM 2: Alien Hunters', "XCOM 2: Anarchy's Children", 'XCOM 2: Resistance Warrior Pack',
    "XCOM 2: Shen's Last Gift", 'XCOM 2: War of the Chosen', 'XCOM 2: War of the Chosen - Tactical Legacy Pack'] },
  { name: 'Tycoon Titans Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-04-30', price: null, games: [
    'Frostpunk', 'PlateUp!', 'RollerCoaster Tycoon® 3: Complete Edition', 'Transport Fever', 'Espresso Tycoon',
    'Farm Manager 2021', 'Farm Manager 2021 - Agrotourism DLC', 'Mad Games Tycoon 2'] },
  { name: 'May 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-05-06', price: null, games: [
    'Amnesia: The Bunker', 'Corpse Keeper', 'Eiyuden Chronicle: Hundred Heroes', 'Evil West',
    'Shadow Gambit: The Cursed Crew', 'STAR WARS™: Bounty Hunter™', 'The Thaumaturge: Deluxe Edition', 'Ultros'] },
  { name: '9 Circles of Bullet Hell: A Survivors Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-05-07', price: null, games: [
    'AK-xolotl: Together', 'Atomicrops', 'Genesis Survivors', 'Genome Guardian', 'Patch Quest', 'Picayune Dreams',
    'Survivors of the Dawn', 'The Textorcist: The Story of Ray Bibbia', 'Vampire Survivors'] },
  { name: 'Xbox Games Studio Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-05-09', price: null, games: [
    'Battletoads', 'Broken Age', 'Sunset Overdrive', 'Age of Empires: Definitive Edition', 'As Dusk Falls',
    'Ori and the Will of the Wisps', 'Quantum Break', 'Wasteland 3'] },
  { name: 'Team 17: Chains of Command', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-05-14', price: null, games: [
    'Honey, I Joined a Cult', 'King Of The Castle', 'Narita Boy', 'CONSCRIPT', 'Thymesia', 'WARCANA',
    "Classified: France '44", 'Hell Let Loose'] },
  { name: 'TID Breakthrough: Games with Links to the Diabetes Community', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-05-16', price: null, games: [
    'Batman - The Telltale Series', 'Batman: The Enemy Within - The Telltale Series', 'Never Alone (Kisima Ingitchuna)',
    'Observation', 'Sam & Max Save the World', 'Sam & Max: Beyond Time and Space', 'Station to Station',
    'Walking Dead + 400 Days'] },
  { name: 'Stomp & Chomp Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-05-21', price: null, games: [
    'I Wani Hug that Gator!', 'Parkasaurus', 'Terror of Hemasaurus', 'Amber Isle', 'Fossilfuel 2',
    'Prehistoric Kingdom', 'Turok 3: Shadow of Oblivion'] },
  { name: 'Badass Brawlers Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-05-28', price: null, games: [
    'Double Dragon Neon', 'Final Vendetta', 'Full Metal Furies', 'River City Girls', 'Young Souls',
    'Dawn of the Monsters', 'River City Girls 2'] },
  { name: 'Power Up Pride', store: 'Humble Bundle', kind: 'bundle', date: '2025-05-30', price: null, games: [
    'A Normal Lost Phone', 'Heart of the Woods', 'Welcome to Elk', 'Sticky Business', 'Echoes of the Plum Grove',
    'Kindred Spirits on the Roof'] },
  { name: 'June 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-06-03', price: null, games: [
    'Biped', 'Dungeons of Hinterberg', 'Havendock', 'Legacy of Kain™ Soul Reaver 1&2 Remastered', 'Nobody Wants to Die',
    'Sker Ritual', 'Tchia', 'Warhammer 40,000: Boltgun'] },
  { name: 'IGN Live 2025 Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-06-06', price: null, games: [
    'Bloodroots', 'Potion Craft: Alchemist Simulator', 'Slay the Spire', 'art of rally', 'Black Book', 'Old World',
    'The Medium', 'Wartales'] },
  { name: 'Narrative Arc Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-06-11', price: null, games: [
    'Frank and Drake', 'Mutazione', 'Venba', 'Dustborn', 'SEASON: A letter to the future', 'Harold Halibut',
    'Six Ages 2: Lights Going Out'] },
  { name: 'Case & Consequence Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-06-12', price: null, games: [
    'Heavy Rain', 'Lacuna', 'Sherlock Holmes: Crimes and Punishments', 'Song of Farca', 'Between Horizons',
    'BROK the InvestiGator', '山河旅探 Murders on the Yangtze River'] },
  { name: 'Puzzle Pizzazz Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-06-13', price: null, games: [
    'A Guidebook Of Babel', 'Homebody', 'Kingsgrave', 'Paper Trail', 'Behind the Frame: The Finest Scenery',
    'The Abandoned Planet', 'The Entropy Centre', 'The Star Named Eos'] },
  { name: 'June Tunes Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-06-18', price: null, games: [
    'Everhood', 'Onde', 'Wandersong', 'ODDADA', 'ONE BTN BOSSES', '节奏快打/Rhythm Fighter', 'DJMAX RESPECT V', 'Ragnarock',
    'Trombone Champ'] },
  { name: "Serenity Forge Storyteller's Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2025-06-20', price: null, games: [
    'LISA', 'LISA the Joyful', 'Neversong', 'Paratopic', "Death's Gambit: Afterlife", 'Lifeless Planet', 'Smile For Me',
    'Virgo Versus the Zodiac', 'Arcadian Atlas', 'Lifeless Moon', 'Long Gone Days'] },
  { name: '2K Classic Trilogies: Mafia X Bioshock', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-06-25', price: null, games: [
    'BioShock 2 Remastered', 'BioShock Infinite', 'BioShock Remastered', 'Mafia II: Definitive Edition',
    'Mafia III: Definitive Edition', 'Mafia: Definitive Edition'] },
  { name: 'Upload VR Summer 2025', store: 'Humble Bundle', kind: 'bundle', date: '2025-06-27', price: null, games: [
    'Moss: Book II', 'MOTHERGUNSHIP: FORGE', 'Townsmen VR', 'Pirates VR: Jolly Roger', 'The Light Brigade',
    'Until You Fall', 'Hard Bullet', 'Vertigo 2'] },
  { name: 'July 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-07-01', price: null, games: [
    'Blanc', 'Cat Quest III', 'DAEMON X MACHINA', "Death's Door", 'Everafter Falls', 'Neo Cab',
    'Warhammer 40,000: Rogue Trader', 'Wizard with a Gun'] },
  { name: 'Summer Splash', store: 'Humble Bundle', kind: 'bundle', date: '2025-07-02', price: null, games: [
    'Aquarium Designer', 'Stranded Sails - Explorers of the Cursed Islands', 'Ultimate Fishing® Simulator', 'ABZÛ',
    'Blazing Sails', 'Fishing: North Atlantic', 'Crab God', 'Koa and the Five Pirates of Mara'] },
  { name: 'Summer Games Done Quick 2025', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-07-04', price: null, games: [
    'Astra And The New Constellation', 'Catlateral Damage: Remeowstered', 'CODE Bunny', 'Finding Frankie',
    "Lenna's Inception", 'Lumina Rush', 'MainFrames', 'Red Alliance', 'RollerCoaster Tycoon: Deluxe'] },
  { name: 'Humblecraft: RTS Rush', store: 'Humble Bundle', kind: 'bundle', date: '2025-07-09', price: null, games: [
    'AI War 2', 'Commandos 2: Men of Courage', 'Commandos 3: Destination Berlin', 'Commandos: Behind Enemy Lines',
    'Commandos: Beyond the Call of Duty', 'Dust Fleet', 'From The Depths', 'Men of War: Assault Squad 2',
    'Stronghold: Definitive Edition', 'Tooth and Tail'] },
  { name: 'Gear Up For Borderlands 4: Borderlands X Wonderlands Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-07-11', price: null, games: [
    'Borderlands 2', 'Borderlands 2 VR', 'Borderlands 3', 'Borderlands GOTY Enhanced', 'Borderlands: The Pre-Sequel',
    'New Tales from the Borderlands', 'Tales from the Borderlands', "Tiny Tina's Wonderlands: Chaotic Great Edition"] },
  { name: 'Devil May Cry: Devil Trigger Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-07-16', price: null, games: [
    'Devil May Cry HD Collection', 'DmC Devil May Cry', 'Devil May Cry 4 Special Edition',
    'Devil May Cry 5 + Vergil'] },
  { name: "Untold Tales' Indie Roulette Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2025-07-18', price: null, games: [
    'ATONE: Heart of the Elder Tree', "Don't Be Afraid", 'Golf Club Nostalgia', 'Mythic Ocean', 'What The Duck',
    'Arise: A Simple Story', 'Flame Keeper', 'The Hong Kong Massacre', 'Everdream Valley', 'Frozenheim'] },
  { name: 'Sniper Elite: Classics Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-07-23', price: null, games: [
    'Sniper Elite', 'Sniper Elite V2 Remastered', 'Sniper Elite 3', 'Sniper Elite 3 Season Pass',
    'Sniper Elite 4 Deluxe Edition', 'Sniper Elite 5'] },
  { name: 'Dungeons & Dragons: Classics Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-07-24', price: null, games: [
    "Al-Qadim: The Genie's Curse", 'D&D Stronghold: Kingdom Simulator', 'DeathKeep', 'DragonStrike',
    'Forgotten Realms: The Archives - Collection Three', 'Dungeons & Dragons: Dark Sun Series',
    'Dungeons & Dragons: Krynn Series', 'Dungeons & Dragons: Ravenloft Series', 'Fantasy Empires',
    'Forgotten Realms: The Archives - Collection One', 'Forgotten Realms: The Archives - Collection Two',
    'Silver Box Classics', 'Spelljammer: Pirates of Realmspace'] },
  { name: 'Better with 4 Friends! Co-Op Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-08-01', price: null, games: [
    'Embr', 'Fling to the Finish', 'Moving Out', 'Portal Knights', 'Rivals of Aether', 'SpiderHeck',
    'TowerFall Ascension', 'Unrailed!'] },
  { name: 'August 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-08-05', price: null, games: [
    'Aksun Playtest', 'Banishers: Ghosts of New Eden', "Let's School", 'Lil Gator Game', 'My Time at Sandrock',
    'Persona 5 Royal', "Tiny Terry's Turbo Trip", 'Warpips', 'Wildmender'] },
  { name: 'Best of Humble Bundle: WB Play the Legends', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-08-06', price: null, games: [
    'Batman: Arkham Asylum GOTY Edition', 'Batman: Arkham City GOTY', 'Injustice: Gods Among Us Ultimate Edition',
    'Mad Max', 'Mortal Kombat XL', 'Suicide Squad: Kill the Justice League', 'Watchmen: The End is Nigh Bundle',
    'Back 4 Blood', 'Batman: Arkham Knight Premium Edition', 'Batman: Arkham Origins', 'FEAR Ultimate Shooter Retail',
    'Gotham Knights', 'Injustice 2 Legendary Edition', 'Middle-earth: Shadow of Mordor Game of the Year Edition',
    'Middle-earth: Shadow of War Definitive Edition', 'Mortal Kombat 11 Ultimate'] },
  { name: 'Uncharted Realms Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-08-08', price: null, games: [
    'A Short Hike', 'Alba: A Wildlife Adventure', 'FAR: Changing Tides', 'The Forgotten City', 'Under The Waves',
    'Journey To The Savage Planet', 'Moon Mystery', 'The Eternal Cylinder', 'Fort Solis'] },
  { name: 'Point Blank Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-08-13', price: null, games: [
    'EMPTY SHELL', 'POSTAL Brain Damaged', 'Rising Front', 'SUPERHOT: MIND CONTROL DELETE', 'Wild Bastards', 'Exfil',
    'High On Life'] },
  { name: 'Table Top Tag Team: Dire Wolf x Marmalade', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-08-15', price: null, games: [
    "Hasbro's BATTLESHIP", 'Raiders of the North Sea', 'The Fox in the Forest', 'THE GAME OF LIFE', 'Wings of Glory',
    'Clue/Cluedo: Classic Edition', 'Root', 'THE GAME OF LIFE 2', 'Ticket to Ride®', 'Yellow & Yangtze'] },
  { name: 'IGN Gamescom Bundle 2025', store: 'Humble Bundle', kind: 'bundle', date: '2025-08-20', price: null, games: [
    'Lost Eidolons', 'Pyrene', 'The Expanse: A Telltale Series', 'ANTONBLAST', 'Bomb Rush Cyberfunk', 'Homeworld 3',
    'Victory Heat Rally'] },
  { name: 'Duo of Justice: Ace Attorney and Mega Man', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-08-27', price: null, games: [
    'Mega Man Legacy Collection', 'Mega Man X Legacy Collection', 'Phoenix Wright: Ace Attorney Trilogy',
    'Mega Man Legacy Collection 2', 'Mega Man X Legacy Collection 2', 'Ghost Trick: Phantom Detective',
    'Mega Man Battle Network Legacy Collection Vol. 2', 'Mega Man Battle Network Legacy Collection Vol. 1',
    'The Great Ace Attorney Chronicles'] },
  { name: 'Draknek & Friends: 12 Years of Great Puzzle Games!', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-08-29', price: null, games: [
    'A Good Snowman Is Hard To Build', 'Cosmic Express', 'Sokobond',
    'The Electrifying Incident: A Monster Mini-Expedition', 'Bonfire Peaks', 'Sokobond Express',
    "A Monster's Expedition", 'LOK Digital'] },
  { name: 'September 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-09-02', price: null, games: [
    'Destiny 2: Legacy Collection (2025)', 'Grapple Dog', 'Return to Monkey Island', 'SpellForce: Conquest of Eo',
    'The Plucky Squire', 'Warhammer 40,000: Speed Freeks', 'WWE 2K25', '斩妖行 Eastern Exorcist'] },
  { name: 'Indie Likes and Lites', store: 'Humble Bundle', kind: 'bundle', date: '2025-09-03', price: null, games: [
    'Luck be a Landlord', 'Rack and Slay', 'Rogue Heroes: Ruins of Tasos', 'The Ouroboros King', 'Crop Rotation',
    'Going Under', "Let's! Revolution!", "Meteorfall: Krumit's Tale", 'Shovel Knight Pocket Dungeon'] },
  { name: 'The Best of Humble Bundle: LEGO Worlds Collide 2025', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-09-03', price: null, games: [
    'LEGO Batman: The Videogame', 'LEGO MARVEL Super Heroes', 'LEGO The Hobbit', 'The LEGO Movie - Videogame',
    "LEGO Marvel's Avengers Deluxe Edition", 'LEGO Batman 2: DC Super Heroes', 'LEGO The Lord of the Rings',
    'The LEGO NINJAGO Movie Video Game', 'LEGO Batman 3: Beyond Gotham Premium Edition',
    'LEGO DC Super-Villains Deluxe Edition', 'LEGO Marvel Super Heroes 2 Deluxe Edition',
    'LEGO® STAR WARS™: The Force Awakens - Deluxe Edition', 'LEGO® Star Wars™:The Skywalker Saga Deluxe Edition',
    'LEGO Jurassic World', 'LEGO The Incredibles', 'LEGO Worlds'] },
  { name: 'Curve Games Care Package', store: 'Humble Bundle', kind: 'bundle', date: '2025-09-05', price: null, games: [
    'Bomber Crew - Deluxe Edition (Game + Season Pass)', 'For The King - Deluxe Edition', 'I Am Fish',
    'KitHack Model Club', 'You Suck at Parking® - Complete Edition', 'Badlands Crew', 'Dungeons of Hinterberg',
    'Lawn Mowing Simulator: Landmark Edition', 'Super Loco World - Cozy Train Automation',
    'The Ascent - Complete Edition'] },
  { name: 'Capcom Retro Revival Pack', store: 'Humble Bundle', kind: 'bundle', date: '2025-09-10', price: null, games: [
    'Capcom Arcade Stadium Complete Pack', 'Dungeons & Dragons: Chronicles of Mystara',
    "Ghosts 'n Goblins Resurrection", 'Strider'] },
  { name: 'Phunky Physics', store: 'Humble Bundle', kind: 'bundle', date: '2025-09-10', price: null, games: [
    'Besiege', 'Human Fall Flat', 'Poly Bridge 2', 'Stick Fight: The Game', 'Totally Accurate Battle Simulator',
    'WHAT THE GOLF?', 'Goat Simulator 3', 'Hardspace: Shipbreaker', 'Instruments of Destruction'] },
  { name: 'Humbling Soulslike Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-09-12', price: null, games: [
    'Achilles: Legends Untold', 'ELDERBORN Metal AF Edition', 'Salt and Sacrifice', 'Asterigos: Curse of the Stars',
    'Steelrising', 'Enotria: The Last Song', 'Flintlock – Deluxe Edition'] },
  { name: 'Critter Chaos Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-09-17', price: null, games: [
    'Copycat', 'Coromon', 'Cassette Beasts', "Meg's Monster", 'Moonstone Island', 'Farewell North', 'Fruitbus',
    'Temtem'] },
  { name: 'Remedy Games - 30th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-09-19', price: null, games: [
    "Alan Wake's American Nightmare", 'Death Rally', 'Max Payne', 'Max Payne 2: The Fall of Max Payne',
    "Alan Wake Collector's Edition", 'Control Ultimate Edition', 'Quantum Break'] },
  { name: 'Lone Survivor Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-09-24', price: null, games: [
    'Above Snakes', 'Breathedge', 'Force of Nature 2', 'State of Decay 2', 'Chernobylite Premium Edition',
    'Conan Exiles', 'DUCKSIDE', 'Forager', 'Starsand'] },
  { name: 'Stories from Latin America', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-09-26', price: null, games: [
    '9 Years of Shadows', 'Arranger: A Role-Puzzling Adventure', 'Dreamcore', 'The Bunny Graveyard', 'despelote',
    'Keylocker | Turn Based Cyberpunk Action', 'Kulebra and the Souls of Limbo', 'Tormented Souls', 'Arco',
    'Enigma of Fear'] },
  { name: 'WAAAGHtober! A Warhammer Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-01', price: null, games: [
    'Warhammer 40,000: Dakka Squadron - Flyboyz Edition', 'Warhammer 40,000: Inquisitor - Prophecy',
    'Warhammer 40,000: Mechanicus', 'Warhammer: Chaosbane', 'Warhammer: End Times - Vermintide',
    'Warhammer: Vermintide 2', 'Warhammer 40,000: Battlesector',
    'Warhammer 40,000: Battlesector - Blood Angels Elites Pack', 'Warhammer 40,000: Battlesector - Tyranid Elites Pack',
    'Warhammer 40,000: Inquisitor - Martyr', 'Warhammer 40,000: Shootas, Blood & Teef',
    'Warhammer 40,000: Space Marine - Anniversary Edition'] },
  { name: 'Close Combat Collection', store: 'Humble Bundle', kind: 'bundle', date: '2025-10-03', price: null, games: [
    'Chronicon', 'Dungeons of Sundaria', 'Blossom Tales 2: The Minotaur Prince', 'Dwarven Realms', 'Into the Necrovale',
    'BloodRayne: Terminal Cut', 'Ghostlore', 'The Last Soldier of the Ming Dynasty'] },
  { name: 'October 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-10-07', price: null, games: [
    'Atomic Heart', 'Caravan Sandwitch', 'Cryptmaster', 'Frogreign Playtest', 'Hotel Renovator', 'Shogun Showdown',
    'STORY OF SEASONS: Pioneers of Olive Town', 'System Shock', 'V Rising'] },
  { name: "Wired's Safe In Our World Anniversary Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-07', price: null, games: [
    'Fractured Minds', 'The Last Worker', 'Those Who Remain', 'Tin Hearts', 'Tiny Troopers: Global Ops', 'Aaero2',
    'Arcade Paradise', 'GRIP: Combat Racing', 'The Falconeer: Revolution Remaster', 'Bulwark: Falconeer Chronicles',
    'Deliver Us The Moon', 'Gori: Cuddly Carnage', 'Martha Is Dead'] },
  { name: 'Cosmic Mysteries & Noir Realities', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-10', price: null, games: [
    'Genesis Noir', 'Tales of the Neon Sea', 'Disco Elysium', 'Glitchhikers: The Spaces Between', 'Chicken Police',
    'NORCO', 'Strangeland', "The Excavation of Hob's Barrow"] },
  { name: 'IGN Fan Fest 2025: Fall Edition', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-13', price: null, games: [
    'Invincible Presents: Atom Eve', 'Predator: Hunting Grounds', 'TerraTech', 'Koira',
    'SpongeBob SquarePants: The Cosmic Shake', 'Wandering Sword', 'Train Sim World® 6: IGN Fan Fest Bundle',
    'Warhammer 40,000: Rogue Trader'] },
  { name: 'Empires and Engines: Return to Tropico & More from Kalypso!', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-15', price: null, games: [
    'Port Royale 3 Gold', 'Tropico 3: Gold Edition', "Tropico 4 Collector's Bundle", 'Port Royale 4 - Extended Edition',
    'Tropico 5 - Complete Collection', 'Railway Empire', 'Railway Empire - Crossing the Andes',
    'Railway Empire - Down Under', 'Railway Empire - France', 'Railway Empire - Germany',
    'Railway Empire - Great Britain & Ireland', 'Railway Empire - Japan', 'Railway Empire - Mexico',
    'Railway Empire - Northern Europe', 'Railway Empire - The Great Lakes', 'Tropico 6 - Caribbean Skies'] },
  { name: 'Momcore: Games For a Busy Life', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-17', price: null, games: [
    'Beans: The Coffee Shop Simulator', 'Beasts of Maravilla Island', 'BOMBFEST', 'We should talk.',
    'Where the Bees Make Honey', 'Kana Quest', 'Onsen Master', 'APICO', 'Calico', 'Calico - Neat Things DLC', 'Lake',
    "Lake - Season's Greetings"] },
  { name: 'Square Enix - Life is Strange True Colors Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-17', price: null, games: [
    'Life is Strange Remastered Collection', 'Life is Strange: True Colors',
    'Life is Strange: True Colors - Deluxe Edition Upgrade'] },
  { name: 'Bandai Namco - Dark Pictures & Little Nightmares Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-22', price: null, games: [
    'The Dark Pictures Anthology: Little Hope', 'The Dark Pictures Anthology: Man of Medan',
    'Little Nightmares - Secrets of The Maw Expansion Pass', 'Little Nightmares Enhanced Edition',
    'Little Nightmares II - Deluxe Edition', 'The Dark Pictures Anthology: House of Ashes',
    'The Dark Pictures Anthology: The Devil in Me'] },
  { name: 'Kingdom: 10th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-24', price: null, games: [
    'Kingdom Eighties', 'Kingdom: New Lands Royal Edition (Dec 2017–present)', 'Kingdom Two Crowns',
    "Kingdom Two Crowns: Archon's Royal Wardrobe", 'Kingdom Two Crowns: OST',
    "Kingdom Two Crowns: Regent's Royal Wardrobe", 'Kingdom Two Crowns: Call of Olympus',
    'Kingdom Two Crowns: Norse Lands'] },
  { name: 'The Myst and Riven Complete Collection 2025', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-28', price: null, games: [
    'Myst III: Exile', 'Myst IV: Revelation', 'Myst V', 'Myst: Masterpiece Edition', 'realMyst: Masterpiece Edition',
    'Riven (1997)', 'Uru: Complete Chronicles', 'Myst', 'Riven'] },
  { name: 'Microids Mega Mix 2025', store: 'Humble Bundle', kind: 'bundle', date: '2025-10-29', price: null, games: [
    'Arkanoid - Eternal Battle', 'Asterix & Obelix Slap Them All! 2', 'Gear.Club Unlimited 2 Ultimate Edition',
    'Grand Mountain Adventure', 'Marsupilami: Hoobadventure', 'Operation Wolf Returns: First Mission', 'Syberia',
    'Syberia 2', 'Syberia 3 + An Automaton with a plan', 'Agatha Christie - Murder on the Orient Express',
    'Garfield Lasagna Party', 'Horse Tales: Emerald Valley Ranch', 'Noob, les Sans-Factions',
    'Syberia - The World Before', 'The Smurfs - Village Party', 'The Smurfs 2 - The Prisoner of the Green Stone'] },
  { name: 'Indie Fears Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-10-30', price: null, games: [
    'Adios', 'Arctic Eggs', 'Buckshot Roulette', 'Daemonologie', 'Kiosk', 'Massacre At The Mirage', 'Mouthwashing',
    'NO-SKIN', 'ORDER 13', 'Terror At Oakheart', 'The Boba Teashop', 'THRESHOLD', "Who's Lila?"] },
  { name: 'Armor Games: The Retro & Reborn Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-10-31', price: null, games: [
    'Crush the Castle Legacy Collection', 'Deep Sleep Trilogy', "Don't Escape Trilogy", 'GemCraft - Chasing Shadows',
    'Infectonator 3: Apocalypse', 'ITTA', 'Nauticrawl', "Bilkins' Folly", 'Decision Legacy Collection',
    'The Elephant Collection', 'The Spirit and the Mouse', "Defender's Quest 2: Mists of Ruin",
    'Swords & Souls Legacy Collection', 'The Last Stand: Aftermath'] },
  { name: 'Horror Icons Showcase', store: 'Humble Bundle', kind: 'bundle', date: '2025-11-01', price: null, games: [
    'Bendy and the Dark Revival', 'Bendy and the Ink Machine', 'Choo-Choo Charles', 'Scorn', 'STASIS: BONE TOTEM',
    'The Axis Unseen', 'The Mortuary Assistant', 'Bendy: Lone Wolf', 'The Thing: Remastered'] },
  { name: 'November 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-11-04', price: null, games: [
    "Another Crab's Treasure", 'Etrian Odyssey HD', 'Lootbane Playtest', 'No More Heroes 3', 'Paleo Pines',
    'Pharaoh: A New Era', 'Spin Hero', 'Synergy', 'Total War: WARHAMMER III'] },
  { name: 'Devil May Cry: Devil Trigger Enhanced Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-05', price: null, games: [
    'Devil May Cry HD Collection', 'DmC Devil May Cry', 'Devil May Cry 4 Special Edition',
    'Devil May Cry 5 Deluxe + Vergil'] },
  { name: 'Monster Hunter Series Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-05', price: null, games: [
    'MONSTER HUNTER RISE', 'MONSTER HUNTER RISE Deluxe Kit', 'Monster Hunter Rise: Sunbreak',
    'Monster Hunter Rise: Sunbreak Deluxe Kit', 'Monster Hunter: World', 'Monster Hunter: World - Deluxe Kit',
    'Monster Hunter World: Iceborne', 'Monster Hunter World: Iceborne Deluxe Kit', 'Monster Hunter Stories',
    'Monster Hunter Stories 2: Wings of Ruin'] },
  { name: 'The Telltale Collection (Nov 2025)', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-06', price: null, games: [
    'Batman - The Enemy Within Shadows Mode', 'Batman - The Telltale Series',
    'Batman - The Telltale Series Shadows Mode', 'Batman: The Enemy Within - The Telltale Series',
    'Tales of Monkey Island: Chapter 1 - Launch of the Screaming Narwhal', 'The Expanse: A Telltale Series',
    'The Walking Dead', 'The Walking Dead: 400 Days', 'The Wolf Among Us'] },
  { name: 'Frogwares: Lovecraft and Sherlock Classics', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-07', price: null, games: [
    'Sherlock Holmes and The Hound of The Baskervilles', 'Sherlock Holmes versus Jack the Ripper',
    'Sherlock Holmes: Nemesis', 'Sherlock Holmes: The Awakened (2008)',
    'Sherlock Holmes: The Mystery of The Persian Carpet', 'Sherlock Holmes: The Secret of the Silver Earring',
    'Sherlock Holmes: Crimes and Punishments', "Sherlock Holmes: The Devil's Daughter",
    'The Testament of Sherlock Holmes', 'Sherlock Holmes Chapter One', 'Sherlock Holmes The Awakened (2023)',
    'The Sinking City Remastered'] },
  { name: 'Indie Game Favorites Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-12', price: null, games: [
    'Airborne Kingdom', 'Everwarder', 'One More Island', 'To The Rescue!', 'Troublemaker', 'Broken Pieces',
    'Echoes of the Plum Grove', 'Immortal Hunters', 'Retreat To Enen', 'Cat Cafe Manager', 'Forgotten Seas',
    'G.I. Joe: Wrath of Cobra', 'Hauntsville'] },
  { name: 'Beyond Virtual Realities Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-14', price: null, games: [
    'Arcaxer', 'Elements Divided', 'Frenzy VR', 'Pixel Ripped 1978: An Atari Adventure', "Venture's Gauntlet VR",
    'Drunkn Bar Fight', 'Plastic Battlegrounds', 'Sail', 'Dragon Fist: VR Kung Fu', 'The Break-In'] },
  { name: 'Headup Games: Brilliant Bargains', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-19', price: null, games: [
    'Bridge Constructor Portal', "Dr. Fetus' Mean Meat Machine", 'INDUSTRIA', 'The Inner World: The Last Wind Monk',
    'Tinkertown', 'Ben and Ed - Blood Party', 'Hell Pie', 'Pumpkin Jack', 'Soulslinger: Envoy of Death',
    'The Textorcist: The Story of Ray Bibbia'] },
  { name: 'Devious Deckbuilders 2', store: 'Humble Bundle', kind: 'bundle', date: '2025-11-21', price: null, games: [
    'Evolings', 'Ring of Pain', 'Deepest Chamber: Resurrection', "Heretic's Fork", 'Roguebook', 'Breach Wanderers',
    'Vault of the Void', '我在地府打麻将'] },
  { name: 'Stories from Assemble Entertainment', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-21', price: null, games: [
    "A Juggler's Tale", 'Encodya', 'Fall of Porcupine', 'FAR: Lone Sails', 'Hauma - A Detective Noir Story',
    'In Between', 'Interrogation: You will be deceived', 'Jessika', "Leisure Suit Larry - Wet Dreams Don't Dry",
    'Leisure Suit Larry - Wet Dreams Dry Twice', 'Minute of Islands', 'Monolith',
    'Plan B from Outer Space: A Bavarian Odyssey', 'Sticky Business', 'The Innsmouth Case', 'Three Minutes to Eight'] },
  { name: '15 for $15 Black Friday Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-26', price: null, games: [
    'Brewmaster: Beer Brewing Simulator', 'Castle Of Alchemists', 'Creaks', 'Degrees of Separation', 'Due Process',
    'Endling - Extinction is Forever', 'Eternal Threads', 'Forward: Escape the Fold - Ultimate Edition',
    "Happy's Humble Burger Farm", 'One Hand Clapping', 'SILT', 'Townsmen - A Kingdom Rebuilt', 'Trinity Fusion',
    'Turbo Kid', 'Yellow Taxi Goes Vroom'] },
  { name: 'Worms 30th Anniversary Celebration', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-26', price: null, games: [
    'Worms', 'Worms Blast', 'Worms Clan Wars', 'Worms Crazy Golf', 'Worms Pinball', 'Worms Reloaded',
    'Worms World Party Remastered', 'Worms Armageddon', 'Worms Revolution', 'Worms Rumble', 'Worms Ultimate Mayhem',
    'Worms W.M.D'] },
  { name: 'Maximum Entertainment: Full Send Bundle!', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-11-28', price: null, games: [
    'Afterimage', 'Bramble: The Mountain King', 'Hammerwatch Anniversary Edition', 'In Nightmare', 'Sclash',
    'Hammerwatch II', 'In Sound Mind', 'Soulstice', 'Double Dragon Gaiden: Rise of the Dragons',
    'Morbid: The Lords of Ire', 'SunnySide'] },
  { name: 'December 2025 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2025-12-02', price: null, games: [
    'Beholder: Conductor', 'Dungeon Tycoon', 'Godlike Burger', 'Intravenous 2',
    'Like a Dragon Gaiden: The Man Who Erased His Name', 'Lost Skies', 'Nine Sols', 'Streets of Rage 4'] },
  { name: 'Rawfury: Rawcember to Remember 2025', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-03', price: null, games: [
    'Friends vs Friends: Deluxe Edition NEW', 'Pizza Possum', 'Atomicrops Deluxe Edition', 'Regions Of Ruin', 'Sable',
    'Tails Noir', 'Tails Noir Preludes', 'Townscaper', 'Bad North: Jotunn Edition', 'Call of the Sea',
    "Kathy Rain: Director's Cut", 'American Arcadia', 'Kathy Rain 2: Soothsayer', 'SKALD: Against the Black Priory'] },
  { name: 'Better with 4 Friends! Co-Op Bundle Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-05', price: null, games: [
    'Embr', 'Fling to the Finish', 'Moving Out', 'Portal Knights', 'Rivals of Aether', 'SpiderHeck',
    'TowerFall Ascension', 'Unrailed!'] },
  { name: 'Upload VR Winter 2025 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-05', price: null, games: [
    "A Fisherman's Tale 2", 'After the Fall® - Deluxe Edition', 'Guardians Frontline',
    'The Walking Dead: Saints & Sinners Tourist Edition', 'Ghosts Of Tabor', 'Hellsweeper VR', 'I Expect You To Die 3',
    'Metal: Hellsinger VR', 'Z.O.N.A: Origin'] },
  { name: 'Team 17: Chains of Command Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-06', price: null, games: [
    "Classified: France '44", 'CONSCRIPT', 'Hell Let Loose', 'Honey, I Joined a Cult', 'King Of The Castle',
    'Narita Boy', 'Thymesia', 'WARCANA'] },
  { name: 'Sniper Elite: Classics Collection Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-07', price: null, games: [
    'Sniper Elite', 'Sniper Elite 3', 'Sniper Elite 3 Season Pass', 'Sniper Elite 4 Deluxe Edition', 'Sniper Elite 5',
    'Sniper Elite V2 Remastered'] },
  { name: 'Gear Up For Borderlands 4: Borderlands X Wonderlands Bundle Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-08', price: null, games: [
    'Borderlands 2', 'Borderlands 2 VR', 'Borderlands 3', 'Borderlands GOTY Enhanced', 'Borderlands: The Pre-Sequel',
    'New Tales from the Borderlands', 'Tales from the Borderlands', "Tiny Tina's Wonderlands: Chaotic Great Edition",
    'Borderlands® 4', 'Borderlands 4 Deluxe Edition', 'Borderlands 4 Super Deluxe Edition'] },
  { name: 'Case & Consequence Collection Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-09', price: null, games: [
    'Between Horizons', 'BROK the InvestiGator', 'Heavy Rain', 'Lacuna', 'Sherlock Holmes: Crimes and Punishments',
    'Song of Farca', '山河旅探 Murders on the Yangtze River'] },
  { name: 'Wholesome Snack 2025: Showcase Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-09', price: null, games: [
    'Botany Manor', 'Kind Words 2', 'Little-Known Galaxy', 'Naiad', 'On Your Tail',
    'Shashingo: Learn Japanese with Photography', 'Snufkin: Melody of Moominvalley', 'Spirittea', 'SUMMERHOUSE'] },
  { name: 'Award Nominations Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2025-12-10', price: null, games: [
    'Pocket Bravery', 'The Vale', 'Chicory: A Colorful Tale', 'Ghostrunner 2', 'IMMORTALITY', 'A Space for the Unbound',
    'Bright Memory: Infinite', 'Cobalt Core', 'I Was a Teenage Exocolonist'] },
  { name: 'Return to Metroidvania Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-10', price: null, games: [
    'Astalon: Tears of the Earth', 'Berserk Boy', 'BioGun', 'Gato Roboto', 'GRIME', 'Islets', 'Monster Sanctuary',
    'Shantae and the Seven Sirens'] },
  { name: 'Humble Heroines 2025 (Dec 2025)', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-11', price: null, games: [
    'Beyond: Two Souls', 'Control Ultimate Edition', 'Darksiders III', 'Kill The Crows',
    'Pathfinder: Wrath of the Righteous - Enhanced Edition', 'Pseudoregalia', 'Thief of Thieves: Season One'] },
  { name: 'June Tunes Bundle Encore', store: 'Humble Bundle', kind: 'bundle', date: '2025-12-12', price: null, games: [
    'Everhood', 'ODDADA', 'Onde', 'Ragnarock', 'Trombone Champ', 'Wandersong', '节奏快打/Rhythm Fighter'] },
  { name: 'Phunky Physics Encore', store: 'Humble Bundle', kind: 'bundle', date: '2025-12-13', price: null, games: [
    'Besiege', 'Hardspace: Shipbreaker', 'Human Fall Flat', 'Instruments of Destruction', 'Poly Bridge 2',
    'Stick Fight: The Game', 'Totally Accurate Battle Simulator', 'WHAT THE GOLF?'] },
  { name: 'RPG Maker Beyond Expectations Bundle Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-13', price: null, games: [
    'Pixel Game Maker MV', 'Pixel Game Maker MV - Cardgame Sample',
    'Pixel Game Maker MV - Weapon assets (100 varieties) and Dot Robot Set',
    'Pixel Game Maker MV -2D Side-scroller Shooting Game Sample Project', 'RPG Maker MV', 'RPG Maker MV - GENE',
    'RPG Maker MV - MADO', 'RPG Maker MV - SAKAN', 'RPG Maker VX Ace'] },
  { name: 'Best of Humble Bundle: WB Play the Legends Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-14', price: null, games: [
    'Back 4 Blood', 'Batman: Arkham Asylum GOTY Edition', 'Batman: Arkham City GOTY',
    'Batman: Arkham Knight Premium Edition', 'Batman: Arkham Origins', 'FEAR Ultimate Shooter Retail', 'Gotham Knights',
    'Injustice 2 Legendary Edition', 'Injustice: Gods Among Us Ultimate Edition', 'Mad Max',
    'Middle-earth: Shadow of Mordor Game of the Year Edition', 'Middle-earth: Shadow of War Definitive Edition',
    'Mortal Kombat 11 Ultimate', 'Mortal Kombat XL', 'Suicide Squad: Kill the Justice League',
    'Watchmen: The End is Nigh Bundle'] },
  { name: 'Humbling Soulslike Bundle Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-15', price: null, games: [
    'Achilles: Legends Untold', 'Asterigos: Curse of the Stars', 'ELDERBORN Metal AF Edition',
    'Flintlock – Deluxe Edition', 'Salt and Sacrifice', 'Steelrising'] },
  { name: 'The Best of Humble Bundle: LEGO Worlds Collide 2025 Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-16', price: null, games: [
    'LEGO Batman 3: Beyond Gotham Premium Edition', 'LEGO DC Super-Villains Deluxe Edition',
    'LEGO Marvel Super Heroes 2 Deluxe Edition', "LEGO Marvel's Avengers Deluxe Edition",
    'LEGO® STAR WARS™: The Force Awakens - Deluxe Edition', 'LEGO® Star Wars™:The Skywalker Saga Deluxe Edition',
    'LEGO Batman 2: DC Super Heroes', 'LEGO Batman: The Videogame', 'LEGO Jurassic World', 'LEGO MARVEL Super Heroes',
    'LEGO The Hobbit', 'LEGO The Incredibles', 'LEGO The Lord of the Rings', 'LEGO Worlds',
    'The LEGO Movie - Videogame', 'The LEGO Movie 2 - Videogame'] },
  { name: 'Dice and Destiny Encore', store: 'Humble Bundle', kind: 'bundle', date: '2025-12-17', price: null, games: [
    'Disco Elysium', 'Pillars of Eternity - Definitive Edition', 'Roadwarden', 'Citizen Sleeper',
    'Pillars of Eternity II: Deadfire - Obsidian Edition', 'Broken Roads'] },
  { name: 'Better With a Friend: Co-op Adventures Encore', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-18', price: null, games: [
    'Cat Quest II', 'For The King - Deluxe Edition', 'For The King II', 'Risk of Rain Returns', 'Tribes of Midgard',
    'Trine 4: The Nightmare Prince'] },
  { name: 'Games Under 5 Hours Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-18', price: null, games: [
    'Arietta of Spirits', "Harmony's Odyssey", 'The Forest Quartet', 'Tobla - Divine Path', 'Gravity Circuit',
    'Mindcop', 'Moduwar', 'Monaco 2', 'Monument Valley', 'Monument Valley 2'] },
  { name: 'Outright Games: Endless Fun Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-19', price: null, games: [
    'Adventure Time: Pirates of the Enchiridion', 'Ben 10: Power Trip', 'Jumanji: Wild Adventures',
    'My Little Pony: A Zephyr Heights Mystery', 'Paw Patrol: On A Roll', 'Monster High™ Skulltimate Secrets™',
    'SpongeBob SquarePants™: The Patrick Star Game', 'Teenage Mutant Ninja Turtles: Mutants Unleashed',
    'The Grinch: Christmas Adventures'] },
  { name: 'Kalypso Strategy and Tactics Pack 2025', store: 'Humble Bundle', kind: 'bundle',
    date: '2025-12-26', price: null, games: [
    'Commandos: Behind Enemy Lines', 'Dungeons', 'Dungeons - Into the Dark', 'Dungeons - Map Pack',
    'Dungeons - The Dark Lord', 'Sudden Strike 2 Gold', 'Sudden Strike 3', 'Sudden Strike Gold',
    'Commandos 2 - HD Remaster', 'Dungeons 2', 'Dungeons 2 - A Chance of Dragons', 'Dungeons 2 - A Game of Winter',
    'Dungeons 2 - A Song of Sand and Fire', 'Praetorians - HD Remaster', 'Sudden Strike 4',
    'Commandos 3 - HD Remaster'] },
  { name: 'The Carnage Collection', store: 'Humble Bundle', kind: 'bundle', date: '2026-01-01', price: null, games: [
    'Death in the Water 2', 'Easy Red 2', 'Warstride Challenges', 'Hellboy Web of Wyrd', 'Laika: Aged Through Blood',
    'Maneater', 'Dead Island 2', 'Dead Island 2 - Expansion Pass', 'Trepang2'] },
  { name: 'Awesome Games Done Quick 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-01-02', price: null, games: [
    'Bloons TD 6', 'BPM: BULLETS PER MINUTE', 'F.E.A.R. 2: Project Origin', "Jazzpunk: Director's Cut",
    "Mika and The Witch's Mountain", 'Nuclear Throne', 'Rise of the Triad: Ludicrous Edition',
    'SEUM: Speedrunners from Hell', 'Shovel Knight: King of Cards'] },
  { name: 'Hunt: Showdown 1896 / Choice Essential DLC Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-01-06', price: null, games: [
    'Hunt: Showdown - Last Gust', 'Hunt: Showdown - Llorona’s Heir', 'Hunt: Showdown – The Concubine',
    'Hunt: Showdown 1896 - Legends of the Bayou', 'Hunt: Showdown - Lonely Howl', 'Hunt: Showdown - Louisiana Legacy',
    'Hunt: Showdown - The Rat', 'Hunt: Showdown - When Shadows Dance', 'Hunt: Showdown – Fear The Reaper',
    'Hunt: Showdown 1896 - The Last Laugh'] },
  { name: 'January 2026 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2026-01-06', price: null, games: [
    'Etrian Odyssey II HD', 'Handmancers Playtest', 'Hunt: Showdown 1896', 'Metal Slug Tactics', 'Nice Day for Fishing',
    'Settlement Survival', 'Sonic Frontiers', 'Tomb Raider IV-VI Remastered', 'Wizard of Legend 2'] },
  { name: 'Decked Out Collection: Great on Handheld', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-01-07', price: null, games: [
    'Nidhogg 2', 'Vampire Survivors', 'Backpack Hero', 'Creatures of Ava', 'Deathbulge: Battle of the Bands', 'Haste',
    'ULTRAKILL'] },
  { name: 'D3 Waifus 4U', store: 'Humble Bundle', kind: 'bundle', date: '2026-01-09', price: null, games: [
    'Ed-0: Zombie Uprising', 'Onechanbara Z2: Chaos', 'SG/ZH: School Girl/Zombie Hunter', 'MAGLAM LORD',
    'Omega Labyrinth Life', 'Bullet Girls Phantasia', 'Onee Chanbara Origin', 'FULL METAL SCHOOLGIRL',
    'SAMURAI MAIDEN'] },
  { name: 'Playful Platformers 2026', store: 'Humble Bundle', kind: 'bundle', date: '2026-01-14', price: null, games: [
    'Lunistice', 'Pogostuck: Rage With Your Friends', 'Super Kiwi 64', 'Demon Turf', 'Grapple Dogs: Cosmic Canines',
    'Move or Die', 'Crumble', 'Kao the Kangaroo', 'PEPPERED'] },
  { name: 'Vibrant Visual Novels', store: 'Humble Bundle', kind: 'bundle', date: '2026-01-14', price: null, games: [
    'eden*', 'Endless Monday: Dreams and Deadlines', 'Gal*Gun Returns', 'Go! Go! Nippon! ~My First Trip to Japan~',
    'Go! Go! Nippon! 2015', 'Go! Go! Nippon! 2016', 'If My Heart Had Wings', 'A Sky Full of Stars',
    'If My Heart Had Wings -Flight Diary-', 'If My Heart Had Wings -Flight Diary- - New Wings: Akari',
    'NEEDY GIRL OVERDOSE', 'Sucker for Love: Date to Die For', 'The Expression Amrilato'] },
  { name: 'The Iceberg Hidden Gems Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-01-16', price: null, games: [
    'Lunacy: Saint Rhodes', 'Minicology', 'Oriental Empires', 'Blazing Sails', 'Hellbreach: Vegas',
    'Mahokenshi - The Samurai Deckbuilder', 'Tech Support: Error Unknown', 'CLeM', 'DOOMBLADE', 'King of Retail',
    'Stars in Shadow'] },
  { name: 'Just Cause Complete Collection 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-01-21', price: null, games: [
    'Just Cause 1 + 2 + DLC Collection', 'Just Cause 3 XXL Edition ROW', 'Just Cause 4 Complete Edition'] },
  { name: 'Best of Humble Bundle: The Sid Meier Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-01-23', price: null, games: [
    'Civilization: Beyond Earth – The Collection', "Sid Meier's Civilization IV: The Complete Edition",
    "Sid Meier's Civilization V: Complete Edition", "Sid Meier's Ace Patrol", "Sid Meier's Ace Patrol: Pacific Skies",
    "Sid Meier's Civilization III: Complete", "Sid Meier's Civilization VI : Anthology", "Sid Meier's Pirates!",
    "Sid Meier's Railroads!", "Sid Meier's Starships"] },
  { name: 'RollerCoaster Tycoon Collection 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-01-23', price: null, games: [
    'RollerCoaster Tycoon 2: Triple Thrill Pack', 'RollerCoaster Tycoon: Deluxe', 'RollerCoaster Tycoon Classic',
    'RollerCoaster Tycoon World', 'RollerCoaster Tycoon® 3: Complete Edition'] },
  { name: 'Nacon Racing Collection 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-01-28', price: null, games: [
    'TT Isle of Man: Ride on the Edge 2', 'V-Rally 4', 'WRC 7', 'WRC 8 FIA World Rally Championship',
    'WRC 9 FIA World Rally Championship', 'WRC Generations - The FIA WRC Official Game',
    'TT Isle Of Man: Ride on the Edge 3', 'WRC 10 FIA World Rally Championship'] },
  { name: 'Best of Humble Bundle Sci-Fi Shooters 2.0', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-02-02', price: null, games: [
    'Battle Shapers', 'Black Mesa', 'DOOM Eternal', 'Prey Digital Deluxe', 'STAR WARS™: Dark Forces Remaster',
    'Starship Troopers: Extermination', 'System Shock 2: 25th Anniversary Remaster'] },
  { name: 'February 2026 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2026-02-03', price: null, games: [
    'Big Helmet Heroes', 'Bus Simulator 21 Next Stop', 'Core Keeper', 'Date Everything!', 'Resident Evil Village',
    'Squirrel with a Gun', 'StarVaders', 'SteamWorld Build'] },
  { name: 'Love You to Death Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-02-11', price: null, games: [
    'DEVOUR', 'FAITH', 'Ghost Watchers', 'Have a Nice Death', 'Iron Lung', 'Life Eater', 'Lunacid',
    'The Bridge Curse 2: The Extrication', 'Without a Dawn'] },
  { name: 'Best of Humble Bundle: Call of the Wild 9th Anniversary', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-02-13', price: null, games: [
    'theHunter: Call of the Wild', 'theHunter: Call of the Wild - ATV',
    'theHunter: Call of the Wild - Tents & Ground Blinds', 'theHunter: Call of the Wild - Weapon Pack 1',
    'theHunter: Call of the Wild™ - Silver Ridge Peaks',
    'theHunter: Call of the Wild™ - Silver Ridge Peaks Cosmetic Pack', 'Call of the Wild: The Angler™',
    'Call of the Wild: The Angler™ – Norway Reserve', 'theHunter: Call of the Wild - Duck and Cover Pack',
    'theHunter: Call of the Wild - Saseka Safari Trophy Lodge', 'theHunter: Call of the Wild - Vurhonga Savanna',
    'theHunter: Call of the Wild - Weapon Pack 2', 'theHunter: Call of the Wild - Wild Goose Chase Gear',
    'theHunter: Call of the Wild™ - Assorted Sidearms Pack',
    'theHunter: Call of the Wild™ - Vurhonga Savanna Cosmetic Pack',
    'theHunter: Call of the Wild - High-Tech Hunting Pack'] },
  { name: 'Overwhelmingly Positive Games Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-02-13', price: null, games: [
    'Bug Fables: The Everlasting Sapling', 'Heavenly Bodies', 'Later Alligator', 'LISA', 'Monster Prom 4: Monster Con',
    'Monster Train', "Nubby's Number Factory", 'The Henry Stickmin Collection'] },
  { name: 'Best of Humble Bundle: Beamdog & Owlcat: RPG Masters', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-02-18', price: null, games: [
    'Icewind Dale: Enhanced Edition', 'MythForce', 'Planescape: Torment: Enhanced Edition',
    "Baldur's Gate II: Enhanced Edition", "Baldur's Gate: Enhanced Edition", "Baldur's Gate: Faces of Good and Evil",
    "Baldur's Gate: Siege of Dragonspear", 'Pathfinder: Kingmaker — Enhanced Plus Edition',
    'Neverwinter Nights: Complete Adventures', 'Pathfinder: Wrath of the Righteous - Enhanced Edition',
    'Pathfinder: Kingmaker - Season Pass', 'Pathfinder: Wrath of the Righteous – Season Pass',
    'Pathfinder: Wrath of the Righteous – Season Pass 2', 'Warhammer 40,000: Rogue Trader'] },
  { name: 'Humble 15 Time Capsule', store: 'Humble Bundle', kind: 'bundle', date: '2026-02-18', price: null, games: [
    'And Yet It Moves', 'Lugaru HD', 'Osmos', 'Samorost 2 + OST', 'Bionic Bay', 'Inkbound', 'KILL KNIGHT',
    'Mark of the Deep - Deluxe Edition', 'Oddsparks: An Automation Adventure'] },
  { name: 'Focus Entertainment Bundle 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-02-20', price: null, games: [
    'Curse of the Dead Gods', 'Shady Part of Me', 'A Plague Tale: Innocence', 'Evil West', 'A Plague Tale: Requiem',
    'Atlas Fallen'] },
  { name: 'Cartridge Chaos', store: 'Humble Bundle', kind: 'bundle', date: '2026-02-25', price: null, games: [
    'Anodyne 2: Return to Dust', 'Astrodogs', 'Super Indie Karts', 'Super Magbot', 'Corn Kidz 64',
    "Mighty Morphin Power Rangers: Rita's Rewind", "Shantae and the Pirate's Curse", 'Vengeful Guardian: Moonrider'] },
  { name: 'Mega Man: Charged Up Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-02-27', price: null, games: [
    'Mega Man Battle Network Legacy Collection Vol. 1', 'Mega Man Battle Network Legacy Collection Vol. 2',
    'MEGA MAN X DiVE Offline', 'Mega Man 11', 'Mega Man Zero/ZX Legacy Collection', 'Mega Man Legacy Collection 2',
    'Mega Man X Legacy Collection 2', 'Mega Man Legacy Collection', 'Mega Man X Legacy Collection'] },
  { name: 'March 2026 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2026-03-03', price: null, games: [
    'Bread & Fred', 'Chants of Sennaar', 'Curse of Pirates Playtest', 'Etrian Odyssey III HD', 'Hard West 2',
    'Smalland: Survive the Wilds', 'SWORN', 'Tempest Rising', 'Zero Hour'] },
  { name: 'Best of Boomer Shooters 5: Penta Boom', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-04', price: null, games: [
    'Immortal Redneck', 'Shooty Shooty Robot Invasion', 'Slayers X', 'Fida Puti Samurai', 'Killing Time: Resurrected',
    'METAL EDEN', 'SULFUR'] },
  { name: 'Games Done Quick: Frost Fatales 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-06', price: null, games: [
    'An Airport for Aliens Currently Run by Dogs', 'Here Comes Niko!', 'Q-UP', 'Super Glitter Rush', 'Voidwrought',
    'Yars Rising', "Yoku's Island Express"] },
  { name: 'The ESA All-Star Alliance Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-07', price: null, games: [
    'Dishonored 2', 'Far Cry Primal', 'Harry Potter: Quidditch Champions', 'State of Decay 2',
    'Mafia Trilogy / Mafia Triple Pack', 'Pentiment', 'Tetris® Forever'] },
  { name: 'The MIX Spring Showcase: Games Around The World', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-09', price: null, games: [
    'Content Warning', 'Falcon Age', 'Semblance', 'Teenage Blob', 'Teenage Mutant Ninja Turtles: Tactical Takedown',
    'Thirsty Suitors', 'ToeJam & Earl: Back in the Groove', 'What Comes After',
    'White Day: A Labyrinth Named School'] },
  { name: 'Frictional Games: Amnesia, SOMA, Penumbra', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-11', price: null, games: [
    'Amnesia: A Machine for Pigs', 'Amnesia: Rebirth', 'Amnesia: The Dark Descent', 'Penumbra Collectors Pack',
    'Amnesia: The Bunker', 'SOMA'] },
  { name: 'Metroidvania Mayhem Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-11', price: null, games: [
    'Aeterna Noctis', 'F.I.S.T.: Forged In Shadow Torch', 'Rabi-Ribi', 'Kingdom Shell', 'Lost Ruins',
    'Ultros Deluxe Edition', 'Gestalt: Steam & Cinder', 'Primal Planet', 'The Devil Within: Satgat'] },
  { name: 'Humble Heroines: Echoes, Voids, and Visions', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-13', price: null, games: [
    'ANNO:Mutationem', 'Cabernet', 'Eastward', 'Ereban: Shadow Legacy', "Sorry We're Closed", 'The Medium'] },
  { name: 'Multiplayer Madness 2026', store: 'Humble Bundle', kind: 'bundle', date: '2026-03-13', price: null, games: [
    'Bogos Binted?', 'Clone Drone in the Danger Zone', 'Keep Talking and Nobody Explodes', 'Party Club',
    'Retail Company Simulator', 'Fish Stick Protocol', 'Phantom Squad', 'Rungore', 'Shotgun Farmers',
    'Shotgun Farmers - Supporter Pack'] },
  { name: 'Movavi Video & Photo Set - Create Awesome Content Easily', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-17', price: null, games: [
    'Movavi Photo Editor', 'Movavi Slideshow Maker 8', 'Movavi Slideshow Maker 8 - Christmas Party Set',
    'Movavi Slideshow Maker 8 - Cinematic Set', 'Movavi Slideshow Maker 8 - Pixel Age Pack', 'Movavi Video Editor 2025',
    'Movavi Video Editor 2025 - Action Pack', 'Movavi Video Editor 2025 - Business Booster Pack',
    'Movavi Video Editor 2025 - Cartoon Animals Pack', 'Movavi Video Editor 2025 - Cinematic Set',
    'Movavi Video Editor 2025 - Creepy Shadows Overlay Pack', 'Movavi Video Editor 2025 - Cutout Alphabet Pack',
    'Movavi Video Editor 2025 - Cyberpunk Overlay Pack', 'Movavi Video Editor 2025 - Digital Overlay Pack',
    'Movavi Video Editor 2025 - Dynamic Transitions Pack', 'Movavi Video Editor 2025 - Emoji Speech Bubbles Pack'] },
  { name: 'Checkmate! A Chess Games Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-18', price: null, games: [
    '5D Chess With Multiverse Time Travel', 'Below the Crown', 'Chess Ultra', 'Chessarama', 'Dark Chess',
    'Gambit Shifter', 'Pawnbarian', 'The Ouroboros King', 'The Rookery', 'Usurper', 'WizardChess'] },
  { name: 'Metro Mania: Planes, Trains, and Automobiles!', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-20', price: null, games: [
    'Juno: New Origins', 'SimplePlanes', 'Super Loco World - Cozy Train Automation', 'The Slaverian Trucker',
    'Expeditions: A MudRunner Game', 'Railbound', 'RAILROADS Online', 'You Suck at Parking® - Complete Edition'] },
  { name: 'Humble 15 for $15 - Spring 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-03-25', price: null, games: [
    'DISTRAINT 2', 'DISTRAINT: Deluxe Edition', 'Dropsy: Warm Damp Hug Edition', 'Glitchhikers: The Spaces Between',
    'ION Shift', 'Janosik 2', 'Kingsgrave', 'LUNARK', 'Necroking', 'Orten Was The Case', 'Pile Up', 'Rocket Rats',
    'Technotopia', 'The Invisible Hand', 'Undead West'] },
  { name: 'Sekai Project 2026', store: 'Humble Bundle', kind: 'bundle', date: '2026-03-27', price: null, games: [
    'Japanese School Life', 'Just Deserts', 'KARAKARA', "Memory's Dogma CODE:01", 'NEKOPARA Vol. 0', 'NEKOPARA Vol. 1',
    'NEKOPARA Vol. 2', 'WORLD END ECONOMiCA episode.01', 'WORLD END ECONOMiCA episode.02',
    'WORLD END ECONOMiCA episode.03', 'Island Diary', 'KARAKARA2', 'My Girlfriend’s Special Place',
    'Ne no Kami - The Two Princess Knights of Kyoto', 'Ne no Kami - The Two Princess Knights of Kyoto Part 2',
    'NEKOPARA Extra'] },
  { name: 'Best of Humble: Fight 4 Your Friends', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-01', price: null, games: [
    'Killing Floor 2 Digital Deluxe Edition & Armory Season Pass 1 & 2', 'The Anacrusis',
    "Warhammer: Vermintide 2 - Collector's Edition", 'Zombie Army Trilogy', 'Back 4 Blood Deluxe',
    'Zombie Army 4: Dead War'] },
  { name: 'Strategic Minds Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-01', price: null, games: [
    'Old World', 'Songs of Conquest', 'Valkyria Chronicles 4 Complete Edition', 'Galactic Civilizations IV',
    'Showgunners Deluxe Edition', 'Terminator: Dark Fate - Defiance', 'The Last Spell'] },
  { name: '2K Tactics & Tycoons', store: 'Humble Bundle', kind: 'bundle', date: '2026-04-03', price: null, games: [
    'Army Men', 'Army Men II', 'Army Men RTS', 'Army Men: Toys in Space', 'CivCity: Rome', 'Freedom Force',
    'Freedom Force vs. the 3rd Reich', 'Homeworld Remastered Collection', 'Homeworld: Deserts of Kharak Deluxe Edition',
    'Railroad Tycoon 2: Platinum', 'Railroad Tycoon 3', 'Shattered Union'] },
  { name: 'April 2026 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2026-04-07', price: null, games: [
    'Artisan TD', "Assassin's Creed Valhalla", 'Buddy Simulator 1984', 'Daemon X Machina: Titanic Scion',
    'Heart Abyss Playtest', 'Planet of Lana', 'The Lord of the Rings: Return to Moria™', 'The Procession to Calvary',
    'Until Then'] },
  { name: 'Destiny 2: Expansions Bundle 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-08', price: null, games: [
    'Destiny 2: Beyond Light Pack', 'Destiny 2: Forsaken Pack', 'Destiny 2: Shadowkeep Pack',
    'Destiny 2: Bungie 30th Anniversary Pack', 'Destiny 2: Lightfall', 'Destiny 2: The Edge of Fate',
    'Destiny 2: The Final Shape', 'Destiny 2: The Witch Queen', 'Destiny 2: Renegades',
    'Destiny 2: Year of Prophecy Ultimate Edition'] },
  { name: 'Sovereign Sandbox Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-04-08', price: null, games: [
    'Ctrl Alt Ego', 'My Little Universe: Complete Edition', 'Nova Lands', 'Wildmender', 'Overthrown',
    'Prehistoric Kingdom', 'The Universim', 'Worshippers of Cthulhu'] },
  { name: 'Humble 15 Golden Tales Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-10', price: null, games: [
    'As Dusk Falls', 'South of the Circle', 'Suzerain', 'Broken Sword - Shadow of the Templars: Reforged',
    'Harold Halibut', 'In Stars And Time', 'SEASON: A letter to the future', 'The Invincible'] },
  { name: 'Tower Defense 2', store: 'Humble Bundle', kind: 'bundle', date: '2026-04-10', price: null, games: [
    'Border Pioneer', 'Kingdom Rush Origins', 'Legion TD 2', 'Tower Escape', 'Affogato', 'Axon TD: Uprising',
    'Dungeon Defenders: Awakened', 'Orcs Must Die! 3', 'Orcs Must Die! 3 - Cold as Eyes Expansion',
    'Orcs Must Die! 3 - Tipping the Scales DLC', 'Thronefall'] },
  { name: 'Humble 15 for $15 - April 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-15', price: null, games: [
    'An Elder Scrolls Legend: Battlespire', 'Blacksmith: Ignite the Forge', 'Dragon Eclipse', 'Embr', 'Gun Frog',
    'Patch Quest', 'Streets of Rogue', 'The Dark Queen of Mortholme', 'Unidentified Falling Objects', 'Yaga',
    'Black Skylands', 'Chip ‘n Clawz vs. The Brainioids', 'Hello Neighbor: Hide and Seek', 'Pinball Spire',
    'UnMetal'] },
  { name: 'Sharp Shooters Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-04-15', price: null, games: [
    'Holy Shoot', 'OUTRIDERS', 'Receiver 2', 'Way of the Hunter', 'EARTH DEFENSE FORCE 5', 'Strike Force Heroes',
    'Wildgate'] },
  { name: 'Speak to the Manager', store: 'Humble Bundle', kind: 'bundle', date: '2026-04-17', price: null, games: [
    'Gladiator Guild Manager', 'Rise of Industry', 'Rise of Industry: 2130', 'Sweet Transit',
    'Endzone - A World Apart | Complete Edition', 'Empires of the Undergrowth', 'Good Company', 'Lawn Mowing Simulator',
    'The Colonists', 'The Colonists - New Lands'] },
  { name: 'Train Sim World 6: First Class Ticket Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-17', price: null, games: [
    'Train Sim World® 6', 'Train Sim World® 6: San Bernardino Line: Los Angeles - San Bernardino Route Add-On',
    'Train Sim World® 6: Diesel Legends of the Great Western Add-On',
    'Train Sim World® 6: East Coast Main Line: Peterborough - Doncaster Route Add-On',
    'Train Sim World® 6: Great Western Express Route Add-On',
    'Train Sim World® 6: LNER Class A3 60103 Flying Scotsman Steam Loco Add-On',
    'Train Sim World® 6: Metrolink Holiday Train Pack',
    'Train Sim World® 6: Pfälzische Ludwigsbahn: Mannheim - Kaiserslautern Route Add-On'] },
  { name: 'VR Kiwi Complete Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-22', price: null, games: [
    'ArtPulse', 'Ashen Arrows', 'LOFI Katana', 'OPERATION SERPENS', 'Seeker: My Shadow', 'Survivorman VR: The Descent',
    'Towers & Powers', 'Cave Digger', 'Cave Digger 2: Dig Harder', 'Pirates VR: Jolly Roger', 'Stilt',
    'Virtual Hunter'] },
  { name: 'Your Move: Turn Based Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-22', price: null, games: [
    'Crown Trick', 'Legends of Kingdom Rush', 'Battle Chasers: Nightwar', 'Dungeons of Aether', 'For The King II',
    'Abalon', 'Deep Sleep: Labyrinth of the Forsaken', 'Moonbreaker'] },
  { name: 'Fore! A Golf Games Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-04-24', price: null, games: [
    '100ft Robot Golf', 'Dangerous Golf', 'Golf Peaks', 'Golfinite', 'Grass Gnome Golf', 'WHAT THE GOLF?', '4D Golf',
    'A Little Golf Journey', 'Dungeon Golf', 'Golfie'] },
  { name: 'MECHA MANIA', store: 'Humble Bundle', kind: 'bundle', date: '2026-04-24', price: null, games: [
    'Mech Mechanic Simulator', 'Mechabellum', 'Star Renegades', 'UFO ROBOT GRENDIZER – The Feast of the Wolves',
    'Oblivion Override', 'Project MIKHAIL', 'Vox Machinae', 'Bounty Star', 'M.A.S.S. Builder'] },
  { name: "Dead Rising: Shop 'Til You Drop Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-29', price: null, games: [
    'Dead Rising Deluxe Remaster', 'Dead Rising 3', 'Dead Rising 4', 'Dead Rising 2',
    'Dead Rising 2: Off the Record'] },
  { name: 'PLAYISM Publisher Bundle - 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-04-29', price: null, games: [
    'BREAK ARTS II', 'Croixleur Sigma - Deluxe Edition', 'Fight Crab', 'LiEat', 'Strange Telephone',
    'Astebreed: Definitive Edition', 'Bright Memory', 'Drago Noka', 'Giraffe and Annika', 'Platform 8',
    'Samurai Bringer', 'The Exit 8', 'The Sealed Ampoule', 'Urban Legend Hunters 2: Double', 'Bright Memory: Infinite',
    'DEEEER Simulator: Your Average Everyday Deer Game'] },
  { name: 'Mexican Entertainment System Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-05-01', price: null, games: [
    'A Tiny Sticker Tale', 'Another Crusade', 'Desktop Fishes', 'Idle Waters', 'Lonesome Village', 'Mulaka',
    'PancitoMerge', 'Pato Box', 'Re:Fresh', 'RKGK / Rakugaki', 'So Below', 'The end is nahual: If I may say so'] },
  { name: 'May 2026 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2026-05-05', price: null, games: [
    'Crysis 3 Remastered', 'Cubic Odyssey', 'Dungeon Baller Playtest', 'Heroes of Hammerwatch II', 'Mini Settlers',
    'Nordhold', 'Rogue Waters', 'Shin Megami Tensei V: Vengeance'] },
  { name: 'Creature Feature Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-05-06', price: null, games: [
    'Cubism', 'Prison Boss VR', 'Budget Cuts Ultimate', 'Crossings', 'Deadly Delivery', 'Thrasher', 'Maestro',
    'Prison Boss Prohibition', 'The Light Brigade'] },
  { name: 'Heavenly Bullets', store: 'Humble Bundle', kind: 'bundle', date: '2026-05-08', price: null, games: [
    'AK-xolotl: Together', 'Army of Ruin', 'Entropy Survivors', 'God Of Weapons', 'God of Weapons: Eternal Nightmare',
    'Greedland', 'I Am Legion: Stand Survivors', 'Karate Survivor', "Keeper's Toll", 'Pesticide Not Required',
    'Sodaman'] },
  { name: 'Ticket to Ride: All Aboard Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-05-08', price: null, games: [
    'Ticket to Ride®', 'Ticket to Ride®: San Francisco City Expansion', 'Ticket to Ride®: USA 1910 Ticket Pack',
    'Ticket to Ride®: Winter Wonderland Bundle', 'Ticket to Ride®: Europe Expansion',
    'Ticket to Ride®: Heart of Africa Expansion', 'Ticket to Ride®: India Expansion',
    'Ticket to Ride®: Japan Expansion', 'Ticket to Ride®: Legendary Asia Expansion',
    'Ticket to Ride®: Nordic Expansion', 'Ticket to Ride®: Switzerland Expansion'] },
  { name: 'Build, Shuffle, Battle!', store: 'Humble Bundle', kind: 'bundle', date: '2026-05-13', price: null, games: [
    'Deck of Haunts', 'Dogpile', 'Knights in Tight Spaces', 'Occlude', 'Placid Plastic Deck - A Quiet Quest',
    'Book of Hours', 'Wildfrost'] },
  { name: 'Humble 15th Anniversary - Indie Icons Showcase', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-05-13', price: null, games: [
    'Celeste', 'Slime Rancher', 'Starbound', 'Citizen Sleeper', 'SUPERHOT', 'The Witness',
    'Bloodstained: Ritual of the Night', 'Risk of Rain Returns'] },
  { name: 'Monster Hunter: Spring Hunting Collection 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-05-18', price: null, games: [
    'Monster Hunter Stories', 'Monster Hunter Stories 2: Wings of Ruin', 'Monster Hunter: World',
    'Monster Hunter: World - Deluxe Kit', 'Monster Hunter World: Iceborne', 'Monster Hunter World: Iceborne Deluxe Kit',
    'MONSTER HUNTER RISE', 'MONSTER HUNTER RISE Deluxe Kit', 'Monster Hunter Rise: Sunbreak',
    'Monster Hunter Rise: Sunbreak Deluxe Kit'] },
  { name: 'Double Shift: Simulation Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-05-20', price: null, games: [
    'Accident', 'Bakery Simulator', 'Brewmaster: Beer Brewing Simulator', 'Castle Flipper', 'Demolish & Build 2017',
    'Demolish & Build 2018', 'Demolish & Build 3', 'Electrician Simulator', 'Plane Accident',
    'Purrrifiers: Cleaning Chaos', 'Youtubers Life', 'BarnFinders', 'BarnFinders: Amerykan Dream',
    'BarnFinders: Bid Wars DLC', "Farmer's Life", 'Firefighting Simulator - The Squad'] },
  { name: 'Perplexing Puzzles', store: 'Humble Bundle', kind: 'bundle', date: '2026-05-20', price: null, games: [
    'Mind Over Magnet', 'Proverbs', 'Abra-Cooking-Dabra', 'Linkito', 'ILA: A Frosty Glide', 'Parallel Experiment',
    'Taiji', 'Viewfinder'] },
  { name: 'Warhammer Skulls 2026 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-05-21', price: null, games: [
    'Blood Bowl 2', 'Space Hulk', 'Warhammer 40,000: Inquisitor - Prophecy',
    'Warhammer 40,000: Dakka Squadron - Flyboyz Edition', 'Warhammer 40,000: Gladius - Relics of War',
    "Warhammer 40,000: Gladius - T'au", 'Warhammer 40,000: Battlesector',
    'Warhammer 40,000: Battlesector - Blood Angels Elites Pack', 'Warhammer 40,000: Battlesector - Tyranid Elites Pack',
    'Warhammer 40,000: Inquisitor - Martyr'] },
  { name: '4X: Xplore, Xpand, Xploit, Xterminate', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-05-22', price: null, games: [
    'AI War 2', 'AI War 2: The Neinzul Abyss', 'AI War 2: The Spire Rises', 'AI War 2: Zenith Onslaught',
    'Distant Worlds 2', 'ENDLESS™ Legend', 'ENDLESS™ Legend - Guardians Expansion Pack',
    'ENDLESS™ Legend - Monstrous Tales', 'ENDLESS™ Legend - Shifters Expansion Pack',
    'ENDLESS™ Legend - The Lost Tales Add-on', 'Interstellar Space: Genesis', 'Rogue Hex', 'Songs Of Silence',
    'Thea 2: The Shattering', 'Distant Worlds 2: Factions - Ikkuro and Dhayut', 'Elemental: Reforged'] },
  { name: 'Awesome Automation Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-05-27', price: null, games: [
    'Factory Town', 'Idle Colony', 'MR FARMBOY', 'Rogue Voltage', "Rusty's Retirement", 'Time to Morp'] },
  { name: 'Devil May Cry: Devil Trigger Reloaded Collection 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-05-27', price: null, games: [
    'Devil May Cry 4 Special Edition', 'Devil May Cry 5 + Vergil', 'DmC Devil May Cry',
    'Devil May Cry HD Collection'] },
  { name: 'Critical Hits: ARPG Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-05-28', price: null, games: [
    'Eldest Souls', 'GreedFall', 'Soulstice: Deluxe Edition', 'BLACKTAIL', 'Blade of Darkness', 'Hellpoint',
    'The Last Hero of Nostalgaia'] },
  { name: 'Humble 12 for $10 Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-05-29', price: null, games: [
    'Anomaly Agent', 'Beat Cop', 'Flooded', 'Hammerwatch II', 'Haunted Lands', 'Hell Pie', 'Liquor Store Simulator',
    'Livelock', 'Once Alive', 'Pumpkin Jack', 'Rubber Bandits', 'Super Meat Boy'] },
  { name: 'June 2026 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2026-06-02', price: null, games: [
    'Citizen Sleeper 2: Starward Vector', 'Construction Simulator', 'Flowers and Deities Playtest', 'Hell Clock',
    'INDIKA', 'Life is Strange: Double Exposure', 'OCTOPATH TRAVELER II', 'Overlooting', 'The Riftbreaker'] },
  { name: '2K Sports Champions Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-06-03', price: null, games: [
    'NBA 2K26', 'NBA 2K26 35,000 Virtual Currency Pack', 'OlliOlli World Rad Edition', 'PGA TOUR 2K25',
    'TopSpin 2K25 Grand Slam Edition'] },
  { name: 'IGN Live Bundle 2026', store: 'Humble Bundle', kind: 'bundle', date: '2026-06-03', price: null, games: [
    'The Last Campfire', 'TOEM', 'Blair Witch', 'Fear the Spotlight', 'Paradise Killer', 'Paradise Killer Soundtrack',
    'Paradise Killer: Art of Paradise', 'Control Ultimate Edition', 'OFF', 'Rollerdrome',
    'Shadow Gambit: The Cursed Crew'] },
  { name: 'We Will Always Be Here: Pride Month 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-06-03', price: null, games: [
    'BAD END THEATER', 'Dustborn', 'Pesterquest', 'We Know the Devil', 'CraftCraft', 'Death of a Wish',
    'Harmony: The Fall of Reverie', 'Tavern Talk', 'The August Before', 'Thirsty Suitors', 'Vampire Therapist'] },
  { name: 'Frosty Games Fest Showcase Bundle 2026: Made in ANZ', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-06-05', price: null, games: [
    '420BLAZEIT2: GAME OF THE YEAR -=Dank Dreams and Goated Memes=- [#wow/11 Like and Subscribe] Poggerz Edition',
    'PROXIMATE', 'Umurangi Generation', 'Umurangi Generation Macro', 'Mini Motorways', 'Knuckle Sandwich', 'Malys',
    'Tempopo', 'Toroa: Skycall', 'Wayward Strand', 'Rival Stars Horse Racing', 'Solium Infernum'] },
  { name: 'Redline Racing Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-06-05', price: null, games: [
    'Descenders', 'MudRunner', 'Parking Garage Rally Circuit', 'art of rally', 'Assetto Corsa Competizione', 'DRIFT CE',
    'TRAIL OUT'] },
  { name: 'The Complete Inkle Library', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-06-10', price: null, games: [
    '80 Days', "Heaven's Vault", 'Overboard!', 'Pendragon', 'Sorcery! Part 3', 'Sorcery! Part 4',
    'Sorcery! Parts 1 & 2', 'A Highland Song', 'Expelled!', 'TR-49'] },
  { name: 'Yuri in Luck: Waifus for Laifus', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-06-10', price: null, games: [
    'Blackberry Honey', 'Highway Blossoms', 'Highway Blossoms: Next Exit', 'Night Cascades', 'Fatal Twelve',
    'Kindred Spirits on the Roof', 'Letters From a Rainy Day -Oceans and Lace-', 'Lilycle Rainbow Stage!!!',
    'OshiRabu: Waifus Over Husbandos', 'Please Be Happy', 'SeaBed'] },
  { name: 'Dungeon Defenders II Complete DLC Chest', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-06-17', price: null, games: [
    "Adventurer's Arsenal Pack", 'Dungeon Defenders II - Halloween Party Pack',
    'Dungeon Defender II - Treasure Trove Pack', 'Dungeon Defenders II - Bundle of the Beast',
    'Dungeon Defenders II - Imperial Cache Pack', 'Dungeon Defender II - Celestial Vault Pack',
    'Dungeon Defender II - Ethereal Trove Pack'] },
  { name: 'Upload VR Summer 2026', store: 'Humble Bundle', kind: 'bundle', date: '2026-06-17', price: null, games: [
    'Among Us 3D: VR', 'Zero Caliber VR', 'Ancient Dungeon VR', 'Arizona Sunshine® Remake', 'Tactical Assault VR',
    'Metro Awakening', 'Thief VR: Legacy of Shadow', 'VTOL VR', 'Zero Caliber 2'] },
  { name: 'June 2unes', store: 'Humble Bundle', kind: 'bundle', date: '2026-06-19', price: null, games: [
    'Kill The Music', 'Rhythm Witch: Beat Death', 'Spin Rhythm XD', 'Thumper', 'Trombone Champ', 'Everhood 2',
    'KALPA: Cosmic Symphony', 'NOISZ', 'Sixtar Gate: STARTRAIL'] },
  { name: 'Going Rogue: A Lite Heavy Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-06-24', price: null, games: [
    'None Shall Intrude', 'Rogue Legacy', 'UnderMine', 'Brutal Orchestra', 'Home Behind 2',
    'Lynked: Banner of the Spark', 'Moros Protocol', 'Nightmare Reaper'] },
  { name: 'Arc System Works: Evo Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-06-26', price: null, games: [
    'CHAOS CODE -NEW SIGN OF CATASTROPHE-', 'GUILTY GEAR', 'GUILTY GEAR XX ACCENT CORE PLUS R', 'KILL la KILL -IF',
    'MELTY BLOOD Actress Again Current Code', 'Arcana Heart 3 LOVEMAX SIXSTARS!!!!!! XTEND',
    'BLAZBLUE CROSS TAG BATTLE Special Edition', 'GUILTY GEAR Xrd REV 2 Deluxe Edition', 'BlazBlue Centralfiction',
    'GUILTY GEAR -STRIVE-', 'UNDER NIGHT IN-BIRTH II Sys:Celes'] },
  { name: "Let's Go Gambling!...aw dang it.", store: 'Humble Bundle', kind: 'bundle',
    date: '2026-07-01', price: null, games: [
    'Dice of Kalma', 'Explosive Odds', 'SIDE EFFECTS', 'SuperTaxCity', 'This Ain’t Even Poker, Ya Joker',
    'Treasure Tiger', 'Dicealot', 'Dicey Dungeons', 'Pip My Dice'] },
  { name: 'Summer Games Done Quick 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-07-03', price: null, games: [
    '20XX', 'DUSK', 'Grandma, No!', 'Maiden & Spell', 'The Gunk', 'Bomb Rush Cyberfunk', 'Isopod', 'Solar Ash'] },
  { name: 'July 2026 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2026-07-07', price: null, games: [
    'Dicefolk', 'Drop Duchy - Complete Edition', 'Infinity: HexaDome Tactics Playtest', 'Neon White',
    'Our Adventurer Guild', 'Police Simulator: Patrol Officers', 'Sea of Stars', 'Sledders', 'TUNIC'] },
  { name: 'Narrative 12 for $10 Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-07-10', price: null, games: [
    'Gone Home', 'Hiveswap Friendsim', 'Mythwrecked: Ambrosia Island', 'Neo Cab', 'No Longer Home', 'Over the Alps',
    'Roadwarden', 'The Darkside Detective: A Fumble in the Dark', 'The Procession to Calvary',
    'The Stillness of the Wind', 'White Shadows', 'Without a Dawn'] },
  { name: 'Squad Goals', store: 'Humble Bundle', kind: 'bundle', date: '2026-07-10', price: null, games: [
    'Content Warning', 'Human Fall Flat', 'KeyWe', 'Kitchen Wars', 'Kritter', 'Murky Divers', 'PHOGS!', 'PlateUp!',
    'Teenage Mutant Ninja Turtles: Splintered Fate', 'Teenage Mutant Ninja Turtles: Splintered Fate - Metalhead'] },
  { name: 'Humble Handhelds Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-07-15', price: null, games: [
    'AMID EVIL', 'Children of Morta: Complete Edition', 'Manifold Garden', 'Nova Drift', 'Blood West', 'Sable',
    'Symphony of War: The Nephilim Saga'] },
  { name: 'Liminal Spaces', store: 'Humble Bundle', kind: 'bundle', date: '2026-07-15', price: null, games: [
    'Liminal Exit', 'LIMINAL SHIFT', 'LIMINAL WATERS - ENHANCED EDITION', 'The Backrooms: Survival',
    'The Cabin Factory', 'Within The Backrooms'] },
  { name: '2K Megahits 2026 Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-07-17', price: null, games: [
    'BioShock Infinite', 'Borderlands 3', 'Bulletstorm: Full Clip Edition',
    'Duke Nukem 3D: 20th Anniversary World Tour', 'Hidden and Dangerous Series Pack', 'Homeworld Remastered Collection',
    'Mafia II: Definitive Edition', 'Risk of Rain 2', 'Tales from the Borderlands', 'The Darkness II', 'The Quarry',
    "Tiny Tina's Wonderlands", 'Tribes of Midgard - Deluxe Edition', 'X-COM: UFO Defense', 'XCOM: Enemy Unknown'] },
  { name: 'Even Steamier Sakura Special', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-07-17', price: null, games: [
    'Sakura Alien', 'Sakura Dungeon', 'Sakura Forest Girls', 'Sakura Forest Girls 2', 'Sakura Forest Girls 3',
    'Sakura Knight 2', 'Sakura Knight 3', 'Sakura MMO', 'Sakura MMO 2', 'Sakura MMO 3', 'Sakura MMO Extra',
    'Sakura Succubus', 'Sakura Succubus 2', 'Sakura Succubus 3', 'Sakura Succubus 4', 'Sakura Succubus 5'] },
  { name: 'Point Click Package', store: 'Humble Bundle', kind: 'bundle', date: '2026-07-22', price: null, games: [
    'STASIS: BONE TOTEM', 'Sunday Gold', 'When The Past Was Around', "Lil' Guardsman",
    'Syberia: The World Before Deluxe Edition', 'Unavowed', 'Agatha Christie - Death on the Nile',
    "Amerzone - The Explorer's Legacy", 'Syberia - Remastered'] },
  { name: 'Twin Sails Interactive 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-07-22', price: null, games: [
    'A Game Of Thrones - A Dance With Dragons', 'A Game Of Thrones - A Feast For Crows',
    'A Game of Thrones: The Board Game', 'Agricola: All Creatures Big and Small', "Arkham Horror: Mother's Embrace",
    'Carcassonne - The Princess & the Dragon Expansion', 'Carcassonne - Traders & Builders',
    'Carcassonne: The Official Board Game', 'Innchanted', 'Inns & Cathedrals - Expansion', 'Isle of Skye', 'Splendor',
    'Splendor - The Cities', 'Splendor - The Strongholds', 'Terraforming Mars',
    'Terraforming Mars - Hellas & Elysium'] },
  { name: 'Animal Style Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-07-24', price: null, games: [
    'A Building Full of Cats 2', 'A Castle Full of Cats', 'Chillquarium', 'Crab God', 'Amber Isle',
    'BROK the InvestiGator', 'Cattails: Wildwood Story', 'Cattails: Wildwood Story Original Soundtrack',
    'Siralim Ultimate'] },
  { name: 'Idlers and Desktop Companions', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-07-24', price: null, games: [
    'Desktop Defender', 'How to Train Your Cock', 'My Little Life', 'Plantera 2: Golden Acorn', 'Pupple Pop',
    "Ropuka's Idle Island", 'Berserk B.I.T.S', 'Dark Hunting Ground', 'Focus Grove', 'Kin and Quarry',
    'Military Incremental Complex', "Rusty's Retirement", 'Spirit City: Lofi Sessions'] },
  { name: 'Rage Inducing Difficult Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-07-29', price: null, games: [
    'Getting Over It with Bennett Foddy', 'Never Give Up', 'Pogostuck: Rage With Your Friends', 'Splodey',
    'Aeterna Noctis: Exclusive Walpapers', 'Aeterna: Darkness Megapack', 'Egging On', 'Ghostrunner', 'GRIME',
    'GRIME - Score (Ambiances from the Game)', 'GRIME - Soundtrack', 'Jump King', "Lorn's Lure"] },
  { name: 'Dungeons & Dragons: Classics Collection 2026', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-07-31', price: null, games: [
    "Al-Qadim: The Genie's Curse", 'D&D Stronghold: Kingdom Simulator', 'DeathKeep', 'DragonStrike',
    'Forgotten Realms: The Archives - Collection Three', 'Dungeons & Dragons: Dark Sun Series',
    'Dungeons & Dragons: Krynn Series', 'Dungeons & Dragons: Ravenloft Series', 'Fantasy Empires',
    'Silver Box Classics', 'Spelljammer: Pirates of Realmspace', 'Dungeons & Dragons: Dragonshard',
    'Forgotten Realms: Demon Stone', 'Forgotten Realms: The Archives - Collection One',
    'Forgotten Realms: The Archives - Collection Two'] },
  { name: 'August 2026 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2026-08-04', price: null, games: [
    'Conquest Dark', 'Dark Envoy', 'Dead Cells', 'Dead Cells: The Bad Seed', 'Decktamer', 'Gatekeeper',
    'King in the Mountain Playtest', 'Like a Dragon: Infinite Wealth', 'Pile Up!',
    "TMNT: Shredder's Revenge - Ultimate Edition"] },
  { name: 'In Your World VR Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-08-05', price: null, games: [
    'DOOM VFR', 'Into the Radius VR', 'Labyrinthine', 'Racket: Nx', 'Sairento VR', 'The Utility Room',
    'Wrath: Aeon of Ruin VR'] },
  { name: 'No More Robots: The Unhinged Indie Anthology', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-08-05', price: null, games: [
    'Not Tonight', 'Not Tonight - One Love DLC', 'Not Tonight 2', 'Slayers X', 'TombStar', 'Earth Must Die',
    'Hypnospace Outlaw', "Let's Build a Zoo", 'Spirittea', 'Starless Abyss', 'Yes, Your Grace'] },
  { name: 'Awesome Indie Adventures', store: 'Humble Bundle', kind: 'bundle', date: '2026-08-07', price: null, games: [
    'Before Your Eyes', 'Beyond a Steel Sky', 'Beyond a Steel Sky Soundtrack', 'Kitaria Fables',
    'Moonlighter: Complete Edition', 'Baladins', 'Jenny LeClue - Detectivu', 'Wavetale', 'BIOMORPH', 'Post Trauma',
    'The Pathless'] },
  { name: 'Short Games Showcase Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-08-07', price: null, games: [
    "A Juggler's Tale", 'A Tiny Sticker Tale', 'Astro Prospector', 'Fill Up The Hole', "Old Man's Journey",
    'Scanner Sombre', 'Teacup', 'Anomaly Agent', 'Biped', 'Botany Manor', 'Knightica', 'Monster Prom 2: Monster Camp',
    'NanoApostle', 'The Dark Queen of Mortholme'] },
  { name: 'Handsome Husbandos', store: 'Humble Bundle', kind: 'bundle', date: '2026-08-12', price: null, games: [
    'A Date with Death - Art and Guide Book', 'A Date with Death - Beyond the Bet DLC',
    'A Date with Death - Expansion DLC', 'Bakumatsu Renka SHINSENGUMI', 'Fashioning Little Miss Lonesome', 'MAMIYA',
    'DesperaDrops', 'OZMAFIA!!', 'Nightshade', "Our Life: Beginnings & Always - Baxter's Story",
    'Our Life: Beginnings & Always - Cove Wedding Story', "Our Life: Beginnings & Always - Derek's Story",
    'Our Life: Beginnings & Always - Step 1 Expansion', 'Our Life: Beginnings & Always - Step 2 Expansion',
    'Our Life: Beginnings & Always - Step 3 Expansion', 'Steam Prison'] },
  { name: "Indie's Support for Venezuela Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2026-08-12', price: null, games: [
    '9 Years of Shadows', 'Arco', 'Bug Fables: The Everlasting Sapling', 'Calico', 'Dandara: Trials of Fear Edition',
    'Jason Maxx', 'Lonesome Village', 'Mexico, 1921. A Deep Slumber.', 'Neon City Riders', 'OYASUMII', 'PopSlinger',
    'Princess Pomu and the 5 Moons', 'RKGK / Rakugaki', 'The end is nahual: If I may say so',
    'The Last Cat in the Universe', 'The Last Cat in the Universe - Supporter Pack'] },
  { name: 'Built Differently: Builder Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-08-14', price: null, games: [
    'Gourdlets', 'I Am Future: Cozy Apocalypse Survival', 'URBO', 'Endzone 2', 'Endzone 2: Artbook',
    'Endzone 2: Soundtrack', 'Per Aspera Deluxe Edition', 'SteamWorld Build', 'Diplomacy is Not an Option',
    'Drill Core', 'Frostpunk: Game of the Year Edition', 'TerraTech', 'TerraTech - Kickstarter Skin Pack',
    'TerraTech - Skin Pack: Falcon Genesis', 'TerraTech - Skin Pack: Fantastic Contraptions',
    'TerraTech - Skin Pack: Historical'] },
  { name: 'Shantae & Heroic Heroines', store: 'Humble Bundle', kind: 'bundle', date: '2026-08-17', price: null, games: [
    'Mighty Switch Force! Hose It Down!', "Shantae: Risky's Revenge - Director's Cut", 'Spidersaurs',
    'Mighty Switch Force! Collection', 'RWBY: Arrowfell', "Shantae and the Pirate's Curse", 'River City Girls',
    'Shantae and the Seven Sirens', 'Shantae: Half-Genie Hero Ultimate Edition'] },
  { name: "Hamble's Summer Island Getaway Bundle", store: 'Humble Bundle', kind: 'bundle',
    date: '2026-08-19', price: null, games: [
    'Flooded', 'ISLANDERS', 'ISLANDERS: New Shores', 'Just a To the Moon Series Beach Episode', 'Caribbean Legend',
    'Forgotten Seas', 'Primordialis'] },
  { name: 'Yes Chef! - Cooking Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-08-19', price: null, games: [
    'Bakery Simulator', 'Brewmaster: Beer Brewing Simulator', 'Burger Bots Inc.', 'Cannibal Cuisine',
    'Recipe for Disaster', 'Tailside: Cozy Cafe Sim', 'Which Sausage, Mate?', 'Bento Blocks', "Don't Let It Starve",
    'Food Truck Simulator', 'Magical Delicacy', 'Pizza Possum', 'UMAMI', 'Chef Knight', 'Tavern Manager Simulator',
    "The Chef's Shift"] },
  { name: 'Humble 15th Anniversary - Ready Player One ... and Two', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-08-21', price: null, games: [
    'Friends vs Friends: Deluxe Edition NEW', 'Killing Floor 3', 'MIMESIS', 'Storebound', 'Streets of Rage 4', 'Vellum',
    'We Were Here Forever'] },
  { name: 'Love Letter to Lovecraft', store: 'Humble Bundle', kind: 'bundle', date: '2026-08-21', price: null, games: [
    'Forgive Me Father', 'Sundered: Eldritch Edition', 'Whisper Mountain Outbreak', 'Abandon Ship', 'Call of Cthulhu',
    'Dagon - The Eldritch Box DLC', 'Dagon - The Little Glass Bottle DLC', 'Dagon - The Railway Horror DLC',
    'Forgive Me Father 2 Deluxe Edition', 'Remnant: From the Ashes', 'Stygian: Outer Gods'] },
  { name: 'Beyond the Metroidverse Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-08-26', price: null, games: [
    'Salt and Sacrifice', 'Salt and Sanctuary', 'HunterX', 'Monster Boy And The Cursed Kingdom',
    'Supraland Six Inches Under', 'Worldless', '勇敢的哈克（HAAK）'] },
  { name: 'PAX West 2026 Bundle', store: 'Humble Bundle', kind: 'bundle', date: '2026-08-28', price: null, games: [
    'GODBREAKERS', 'Neckbreak', 'Order Automatica', 'Parking Garage Rally Circuit', 'The Lacerator', 'Cornucopia',
    'Dark Deity 2', 'Quilts and Cats of Calico', 'Quilts and Cats of Calico Soundtrack'] },
  { name: 'Dread and Dark Fantasies RPG Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-08-31', price: null, games: [
    'Steelrising - Bastille Edition', 'The Axis Unseen', 'Ashen', 'Darksiders Genesis', 'Dread Delusion', 'Kristala',
    'Pillars of Eternity II: Deadfire', 'Torchlight Series'] },
  { name: 'September 2026 Humble Choice', store: 'Humble Bundle', kind: 'sub', date: '2026-09-01', price: null, games: [
    'Ballionaire', 'Frostpunk 2', 'GUNTOUCHABLES', 'Keylocker | Turn Based Cyberpunk Action',
    'Pocket Mirror ~ GoldenerTraum', 'SONIC X SHADOW GENERATIONS', 'Urban Jungle', 'Voidtrain'] },
  { name: 'CRPG Pack: Isometric Immersion', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-02', price: null, games: [
    'Balrum', 'Disco Elysium', 'Gamedec - Definitive Edition', 'Torment: Tides of Numenera', 'Underrail',
    'Black Geyser: Couriers of Darkness', 'Black Geyser: Couriers of Darkness - Tales of the Moon Cult',
    'Pathfinder: Wrath of the Righteous - Game of the Year Edition', 'SKALD: Against the Black Priory Deluxe Edition',
    'Warhammer 40,000: Rogue Trader', 'Warhammer 40,000: Rogue Trader - Season Pass'] },
  { name: 'Mega Man: Recharged Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-02', price: null, games: [
    'Mega Man Battle Network Legacy Collection Vol. 1', 'Mega Man Battle Network Legacy Collection Vol. 2',
    'MEGA MAN X DiVE Offline', 'Mega Man 11', 'Mega Man Zero/ZX Legacy Collection', 'Mega Man Legacy Collection 2',
    'Mega Man X Legacy Collection 2', 'Mega Man Legacy Collection', 'Mega Man X Legacy Collection'] },
  { name: 'Narrative Masterpieces', store: 'Humble Bundle', kind: 'bundle', date: '2026-09-04', price: null, games: [
    'Along the Edge', 'Crowns and Pawns: Kingdom of Deceit', 'We. The Revolution', 'Eliza', 'Sunless Skies',
    'The Pale Beyond', 'IMMORTALITY', 'Tavern Talk 2: Dreamwalker - Drowsy Druid (Decoration Pack)',
    'Tavern Talk 2: Dreamwalker - Wondrous Wizard (Decoration Pack)', 'Tavern Talk Stories: Dreamwalker', 'The Wreck',
    'Wednesdays'] },
  { name: 'Crawling Through the Dungeons', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-09', price: null, games: [
    'Astalon: Tears of the Earth', 'BroomSweeper', 'Crawl', "Cthulhu's Reach: Devil Reef", 'Dungeon Tycoon',
    'Touhou Artificial Dream in Arcadia', 'Wizardry: Labyrinth of Lost Souls', 'Xanadu Next', 'CiniCross',
    'Dungeon Drafters', "The Bard's Tale Trilogy"] },
  { name: 'Decked Out Deckbuilders', store: 'Humble Bundle', kind: 'bundle', date: '2026-09-11', price: null, games: [
    'Cross Blitz', 'Hexarchy', 'SteamWorld Quest: Hand of Gilgamech', 'Dream Tactics', 'Tainted Grail', 'Wingspan',
    'Cultist Simulator', 'Cultist Simulator: Original Soundtrack', 'Cultist Simulator: The Dancer',
    'Cultist Simulator: The Exile', 'Cultist Simulator: The Ghoul', 'Cultist Simulator: The Priest', 'Hadean Tactics',
    'Hadean Tactics: Moonhunter DLC', 'Menace from the Deep', 'Monster Train'] },
  { name: 'Run It Back - Roguelikes Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-11', price: null, games: [
    'Source of Madness', 'Spellmasons', 'Battle Shapers', 'Dome Keeper', 'Dungeons of Blood and Dream', 'OTXO',
    'Chrono Ark', 'Lost in Random: The Eternal Die', 'Rabbit and Steel'] },
  { name: 'Best of Humble Bundle - Sniper Elite: Classics Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-15', price: null, games: [
    'Sniper Elite', 'Sniper Elite 3', 'Sniper Elite 3 Season Pass', 'Sniper Elite V2 Remastered',
    'Sniper Elite 4 Deluxe Edition', 'Sniper Elite 5'] },
  { name: 'Assemble Entertainment Cozy Games Collection', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-16', price: null, games: [
    "A Juggler's Tale", 'Beyond The Edge Of Owlsgard', 'Bound By Blades', 'Fall of Porcupine', 'Growth', 'Itorah',
    'Beacon Patrol', 'Kioku: Last Summer', 'Origament: A Paper Adventure', 'Sticky Business',
    'Sticky Business: Book of Shadows', 'Sticky Business: Camp Zinnias', 'Sticky Business: Plan With Me',
    'Sticky Business: Seaside Tales', 'Verde'] },
  { name: 'Indies in Space', store: 'Humble Bundle', kind: 'bundle', date: '2026-09-16', price: null, games: [
    'Breathedge', 'EVERSPACE', 'EVERSPACE - Encounters', 'EVERSPACE™ - Soundtrack, Artbook, and Wallpapers',
    'Between the Stars', 'Wildgate - Renegade Edition', 'Reality Break', 'Starship Troopers: Extermination',
    'Starship Troopers: Terran Command', 'The Crust'] },
  { name: 'Garbage Dwellers', store: 'Humble Bundle', kind: 'bundle', date: '2026-09-18', price: null, games: [
    'Dimensional Animals', 'Seize the Cheese', 'Tanuki Sunset', 'The Lost Legends of Redwall: The Scout Anthology',
    'Maze Mice', 'RATSHAKER™', 'Warhammer: End Times - Vermintide',
    "Warhammer: End Times - Vermintide Collector's Edition Content", 'Warhammer: Vermintide 2',
    "Warhammer: Vermintide 2 - Collector's Edition", 'A Plague Tale: Innocence', 'Tails Noir', 'Tails Noir Preludes',
    'The Spirit and the Mouse', 'Brew', 'Trash Goblin'] },
  { name: 'IGN 30th Anniversary Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-18', price: null, games: [
    'Sonic Adventure™ 2', 'Thronebreaker: The Witcher Tales', 'Ravenswatch', 'Subnautica', 'BlazBlue Entropy Effect',
    'Remnant II', 'The Elder Scrolls Online - Elsweyr'] },
  { name: 'The Almighty God Games Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-21', price: null, games: [
    'Equilinox', 'Technotopia', 'Warbox Sandbox', 'Deisim', 'Godhood', 'Shadows of Forbidden Gods', 'The Universim'] },
  { name: 'Best of Humble Bundle - Indie Fears Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-23', price: null, games: [
    'Arctic Eggs', 'Buckshot Roulette', 'Flesh Made Fear', 'Kiosk', "Mama's Sleeping Angels", 'Mouthwashing', 'NO-SKIN',
    'ORDER 13', 'PANICORE', 's.p.l.i.t', 'The Headliners', 'The Skin Stapler', 'THRESHOLD', "Who's Lila?"] },
  { name: 'Trineverse Triple Co-Op Pack', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-23', price: null, games: [
    'Nine Parchments', 'Trine', 'Trine 2: Complete Story', 'Trine 3: The Artifacts of Power',
    'Trine 4: The Nightmare Prince'] },
  { name: 'Fall into Fall Fun-dle', store: 'Humble Bundle', kind: 'bundle', date: '2026-09-25', price: null, games: [
    'Alchemy Story', 'Bunny Park', 'Outlanders', 'Sugar Shack', 'Witch It', 'Alchemist Shop Simulator',
    "Mika and The Witch's Mountain", 'Witchtastic'] },
  { name: 'Gear & Glory Action RPGs', store: 'Humble Bundle', kind: 'bundle', date: '2026-09-25', price: null, games: [
    'Achilles: Legends Untold', 'Clash: Artifacts of Chaos', 'Into the Necrovale', 'Sands of Aura',
    'Tower of Babel: Survivors of Chaos', 'Coridden', 'Ghostlore', 'Tower of Kalemonvo', 'Wayfinder'] },
  { name: 'Programming Puzzles Bundle', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-28', price: null, games: [
    'Replicube', 'SOLAS 128', 'while True: learn()', 'Linkito', 'The Signal State', 'Quantum Odyssey',
    'Retro Gadgets'] },
  { name: '2D Rewind Collection from S2 Games', store: 'Humble Bundle', kind: 'bundle',
    date: '2026-09-30', price: null, games: [
    'CHUCHEL', 'Freedom Planet', 'Not Tonight', 'Samorost 3', 'Karate Survivor', 'Luck be a Landlord', 'NORCO',
    'Folklands', 'Freedom Planet 2', 'Nova Drift', 'River City Girls', 'River City Girls 2', '色系战记 Rainbow Legends'] },
  // DailyIndieGame Super Bundles. 34 went on sale July 9, 2015; 33's start isn't known, so it counts from the day
  // after Super Bundle 31 (June 1, 2015).
  { name: 'DailyIndieGame Super Bundle 33', store: 'DailyIndieGame', kind: 'bundle', date: '2015-06-02', price: 1.49, games: [
    'Final Dusk', 'Make it indie!', 'R.O.O.T.S', 'iBomber Attack', 'iBomber Defense', 'iBomber Defense Pacific'] },
  { name: 'DailyIndieGame Super Bundle 34', store: 'DailyIndieGame', kind: 'bundle', date: '2015-07-09', price: 1.49, games: [
    'Bloop', 'Pitiri 1977', 'Storm in a Teacup', 'Streets of Chaos', 'The 39 Steps', "Uriel's Chasm"] },
  // Free key giveaways. Alienware Arena's drop was reported from July 16, 2026 and ran until keys ran out (the end
  // date isn't known, so it runs up to AMD's). AMD Gaming's was posted August 24-25 and gone by August 28.
  { name: 'Dwarven Realms (Alienware Arena giveaway)', store: 'Alienware Arena', kind: 'giveaway', date: '2026-07-16',
    ends: '2026-08-23', price: 0, games: ['Dwarven Realms'] },
  { name: 'Dwarven Realms (AMD Gaming giveaway)', store: 'AMD Gaming', kind: 'giveaway', date: '2026-08-24',
    ends: '2026-08-28', price: 0, games: ['Dwarven Realms'] },
];

const FREE_TO_PLAY = [
  // Valve
  'Dota 2', 'Team Fortress 2', 'Counter-Strike 2', 'Deadlock', 'Alien Swarm', 'Source Filmmaker', 'Dota Underlords',
  'Artifact Classic', 'Artifact Foundry', 'Aperture Desk Job', 'The Lab',
  // others
  'Battlefield 6', 'Call of Duty', 'Call of Duty: Warzone', 'PUBG: BATTLEGROUNDS', 'Apex Legends', 'Warframe',
  'Path of Exile', 'Path of Exile 2', 'Destiny 2', 'Brawlhalla', 'Rec Room', 'Rocket League', 'SMITE', 'Paladins',
  'Realm Royale', 'Quake Champions', 'Z1 Battle Royale', 'H1Z1', 'Warhammer 40,000: Eternal Crusade', 'Heroes & Generals',
  'Dirty Bomb', 'Blacklight: Retribution', 'Double Action: Boogaloo', 'Wolfenstein: Enemy Territory',
  'Screaming Chicken: Ultimate Showdown', 'Project Playtime', 'Unturned', 'War Thunder', 'Halo Infinite', 'THE FINALS',
  'Marvel Rivals', 'NARAKA: BLADEPOINT', 'Lost Ark', 'Neverwinter', 'Star Trek Online', 'Fallout Shelter',
  'Idle Champions of the Forgotten Realms', 'Aimlabs', 'Totally Accurate Battlegrounds', 'Spellbreak', 'Trackmania',
  'TrackMania Nations Forever', 'MechWarrior Online', 'Realm of the Mad God Exalt',
  'Dungeon Defenders II', 'Secret World Legends', 'Battlerite', 'Crusader Kings II', 'Stumble Guys', 'Bloons TD Battles 2',
  'Delta Force', 'Once Human', 'The First Descendant', 'Warhammer 40,000: Dark Nexus Arena', 'Enlisted', 'Overwatch 2',
  'Splitgate', 'Spectre Divide', 'VRChat', 'Warhammer 40,000: Boltgun - Words of Vengeance', 'The Sims 4',
  'Guild Wars 2', 'EVE Online', 'Star Wars: The Old Republic', 'The Lord of the Rings Online',
  'Dungeons & Dragons Online', 'RuneScape', 'Old School RuneScape', 'MapleStory', 'World of Tanks', 'World of Warships',
  'Crossout', 'Warface', 'PlanetSide 2', 'Trove', 'Albion Online', 'Doki Doki Literature Club', 'Clicker Heroes', 'AdVenture Capitalist',
  'Fishing Planet', 'Russian Fishing 4', 'Yu-Gi-Oh! Master Duel', 'Eternal Return', 'Super Animal Royale',
  'Sky: Children of the Light', 'Arena Breakout: Infinite', 'Dauntless',
];
