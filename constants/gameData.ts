export interface StoryChoice {
    id: string;
    text: string;
    nextNodeId: string;
    statChanges?: {
        darkness?: number;
        light?: number;
        gaia?: number;
    };
    itemGain?: string;
}

export interface StoryNode {
    id: string;
    text: string;
    choices: StoryChoice[];
    sceneImage: string;
    speaker?: string;
    speakerColor?: string;
    mood?: 'neutral' | 'tense' | 'dark' | 'warm' | 'epic';
}

export interface CharacterStats {
    darkness: number;
    light: number;
    gaia: number;
}

export interface GameState {
    currentNodeId: string;
    stats: CharacterStats;
    inventory: string[];
    storyHistory: string[];
    visitedNodes: string[];
}

export const initialGameState: GameState = {
    currentNodeId: 'start',
    stats: {
        darkness: 15,
        light: 10,
        gaia: 5,
    },
    inventory: ['Tattered Shirt'],
    storyHistory: [],
    visitedNodes: [],
};

export const storyNodes: Record<string, StoryNode> = {
    start: {
        id: 'start',
        text: 'You wake up in the dark. Your body lies on cold stone, and your pale skin feels like ash. A dark, ancient mark is burned into your chest. You do not remember who you are, but you know you did not return to suffer—you returned to rule.\n\nThe crypt is silent save for the distant drip of water echoing through unseen corridors. Faint runes pulse dimly on the walls, their light barely enough to see the outline of your own hands.',
        sceneImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
        mood: 'dark',
        choices: [
            {
                id: 'examine_mark',
                text: 'Examine the burned mark',
                nextNodeId: 'examine_mark',
                statChanges: { darkness: 5 },
            },
            {
                id: 'search_crypt',
                text: 'Search the crypt',
                nextNodeId: 'search_crypt',
                statChanges: { gaia: 3 },
            },
        ],
    },
    examine_mark: {
        id: 'examine_mark',
        text: 'You press your fingers against the searing mark on your chest. Pain lances through you—not physical, but something deeper, as if your very soul is being read.\n\nVisions flash: a towering citadel of obsidian, armies bowing before a throne of shadow, a woman with silver eyes whispering your name—Merunes. The mark pulses with dark energy, and you feel power stirring within you, ancient and terrible.\n\nThe runes on the walls flare brighter in response, revealing two passages branching from the crypt.',
        sceneImage: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80',
        mood: 'dark',
        choices: [
            {
                id: 'embrace_power',
                text: 'Embrace the dark power',
                nextNodeId: 'embrace_darkness',
                statChanges: { darkness: 10 },
            },
            {
                id: 'resist_visions',
                text: 'Resist the visions and steady yourself',
                nextNodeId: 'resist_visions',
                statChanges: { light: 8 },
            },
        ],
    },
    search_crypt: {
        id: 'search_crypt',
        text: 'You rise on unsteady legs and move through the darkness. Your hands trace along damp stone walls, feeling ancient carvings beneath your fingers—stories written in a language you somehow understand.\n\nIn a shallow alcove, you find a rusted iron dagger and a leather-bound journal. The journal\'s pages are brittle, but the last entry reads: "The Architect sleeps. When they wake, the Weaver will know. Run."\n\nA cold draft sweeps through the crypt. Something stirs in the shadows ahead.',
        sceneImage: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80',
        mood: 'tense',
        choices: [
            {
                id: 'take_dagger',
                text: 'Take the dagger and advance',
                nextNodeId: 'take_dagger',
                statChanges: { darkness: 3, gaia: 5 },
                itemGain: 'Rusted Iron Dagger',
            },
            {
                id: 'read_journal',
                text: 'Study the journal more closely',
                nextNodeId: 'read_journal',
                statChanges: { light: 5, gaia: 3 },
                itemGain: 'Ancient Journal',
            },
        ],
    },
    embrace_darkness: {
        id: 'embrace_darkness',
        text: 'You let the darkness in. It floods through you like black water filling a vessel, and for a moment you are drowning—then you are the ocean itself.\n\nYour eyes adjust beyond mere sight. You can feel the crypt\'s geometry in your mind, sense the ley lines of power threaded through the earth beneath you. The mark on your chest burns cold now, a beacon for things that dwell between worlds.\n\nA voice echoes from nowhere and everywhere: "The Architect remembers. Good. The Consortium grows fat on stolen power. Will you reclaim what is yours?"\n\nTwo paths glow before you—one descending deeper into the earth, the other leading toward distant daylight.',
        sceneImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
        speaker: 'Unknown Voice',
        speakerColor: '#8b3fd4',
        mood: 'dark',
        choices: [
            {
                id: 'descend_deeper',
                text: 'Descend into the depths',
                nextNodeId: 'depths',
                statChanges: { darkness: 8 },
            },
            {
                id: 'seek_light',
                text: 'Move toward the daylight',
                nextNodeId: 'daylight',
                statChanges: { light: 5, gaia: 3 },
            },
        ],
    },
    resist_visions: {
        id: 'resist_visions',
        text: 'You grit your teeth and force the visions away. The mark\'s glow fades to a dull ember. You are Merunes—that much you accept—but you will not be a puppet of old power.\n\nClarity returns. You notice details the visions obscured: scratch marks on the stone floor, as if someone was dragged. A faint warmth emanating from the eastern wall, suggesting a passage beyond. And carved into the arch above, a warning in the old tongue: "The Weaver sees all who claim the Crown."\n\nYour resolve feels like armor. Whatever waits ahead, you will face it with clear eyes.',
        sceneImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
        mood: 'tense',
        choices: [
            {
                id: 'follow_scratches',
                text: 'Follow the scratch marks',
                nextNodeId: 'depths',
                statChanges: { gaia: 5, light: 3 },
            },
            {
                id: 'warm_wall',
                text: 'Investigate the warm eastern wall',
                nextNodeId: 'daylight',
                statChanges: { light: 7 },
            },
        ],
    },
    take_dagger: {
        id: 'take_dagger',
        text: 'The dagger\'s handle fits your grip as if it was forged for your hand alone. The rust flakes away at your touch, revealing dark steel etched with symbols that match the mark on your chest.\n\nYou advance into the shadow. The stirring grows louder—a wet, clicking sound, like bones being reassembled. Then you see it: a creature of twisted sinew and pale light, a Hollow, leftover refuse of the Void.\n\nIt turns eyeless sockets toward you and screams without sound. The dagger in your hand thrums with hungry energy.',
        sceneImage: 'https://images.unsplash.com/photo-1509248961620-e9d5eb53b6bf?w=800&q=80',
        mood: 'tense',
        choices: [
            {
                id: 'fight_hollow',
                text: 'Fight the Hollow',
                nextNodeId: 'fight_hollow',
                statChanges: { darkness: 5, gaia: 3 },
            },
            {
                id: 'command_hollow',
                text: 'Attempt to command it with the mark\'s power',
                nextNodeId: 'command_hollow',
                statChanges: { darkness: 10 },
            },
        ],
    },
    read_journal: {
        id: 'read_journal',
        text: 'You crouch beside the alcove and carefully turn the journal\'s pages. Most are destroyed by time and damp, but fragments survive:\n\n"...the Architect built the barriers between worlds, but the Weaver unravels them..."\n"...three who were loyal: the Blade, the Healer, the Shadow. If the Architect falls, they will wait..."\n"...Varen guards the eastern passage. Elara tends the wounded earth. Lianna watches from places no one thinks to look..."\n\nThe final page bears a map—crude but legible—showing tunnels branching from this very crypt. One leads to a mark labeled "Sanctuary." Another to "The Maw."\n\nKnowledge is a weapon. You feel sharper already.',
        sceneImage: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80',
        mood: 'neutral',
        choices: [
            {
                id: 'go_sanctuary',
                text: 'Head toward the Sanctuary',
                nextNodeId: 'daylight',
                statChanges: { light: 8, gaia: 5 },
            },
            {
                id: 'go_maw',
                text: 'Brave the path to The Maw',
                nextNodeId: 'depths',
                statChanges: { darkness: 8, gaia: 3 },
            },
        ],
    },
    depths: {
        id: 'depths',
        text: 'The tunnel descends steeply, the air growing thick with the scent of iron and something older—something that was ancient when the mountains were young.\n\nThe walls here are not carved but grown, crystalline formations of dark amethyst that hum with trapped energy. Your mark responds, pulling you forward like a compass needle finding north.\n\nAt the bottom, a vast underground chamber opens before you. In its center stands a figure in dark armor, their blade embedded in the stone floor. They do not move, but you sense they are not dead—merely waiting.\n\nA voice, rough as gravel: "Took you long enough, Architect. I\'ve been guarding this door for longer than I care to remember."\n\nThe figure raises their head. Scarred. Weary. But eyes burning with fierce loyalty.\n\n"My name is Varen. And we have much to discuss."',
        sceneImage: 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=800&q=80',
        speaker: 'Varen',
        speakerColor: '#c41e3d',
        mood: 'epic',
        choices: [
            {
                id: 'trust_varen',
                text: '"I remember nothing. Tell me everything."',
                nextNodeId: 'varen_alliance',
                statChanges: { light: 5, gaia: 5 },
            },
            {
                id: 'demand_varen',
                text: '"Prove your loyalty before I trust you."',
                nextNodeId: 'varen_test',
                statChanges: { darkness: 5 },
            },
        ],
    },
    daylight: {
        id: 'daylight',
        text: 'You climb toward the light. The passage narrows, then bursts open onto a ledge overlooking a vast, broken landscape.\n\nThe sky is the color of a bruise—purple and sickly yellow, split by threads of darkness that writhe like living things. Below, the ruins of what was once a great city stretch to the horizon. Towers of white stone, now cracked and overgrown, lean against each other like wounded soldiers.\n\nBut there is life here too. In a sheltered valley below the ledge, firelight flickers. Tents. People. And standing at the edge of the camp, as if she knew you were coming, a woman with her hands pressed to the wounded earth, green light flowing from her palms.\n\nShe looks up. Her eyes widen.\n\n"Merunes? Is it truly...?" Her voice catches. "I am Elara. And Gaia weeps with joy at your return."',
        sceneImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
        speaker: 'Elara',
        speakerColor: '#3aad62',
        mood: 'warm',
        choices: [
            {
                id: 'greet_elara',
                text: '"Elara. I need your help to remember."',
                nextNodeId: 'elara_alliance',
                statChanges: { light: 5, gaia: 8 },
            },
            {
                id: 'question_elara',
                text: '"What happened to the world while I slept?"',
                nextNodeId: 'elara_lore',
                statChanges: { gaia: 5, light: 3 },
            },
        ],
    },
    fight_hollow: {
        id: 'fight_hollow',
        text: 'You lunge forward, dagger leading. The Hollow shrieks and lashes out with limbs that bend in impossible directions. But the dark steel bites true—wherever it touches the creature, the pale light sputters and dies.\n\nThe fight is brutal and brief. You move with an instinct that predates your lost memories, each strike precise, each dodge effortless. When the Hollow dissolves into motes of fading light, you stand breathing hard, the dagger humming with satisfaction.\n\nThe creature\'s remains congeal into a small, pulsing orb of void energy. It hovers before you, drawn to the mark on your chest.\n\nYour first victory. It will not be your last.',
        sceneImage: 'https://images.unsplash.com/photo-1509248961620-e9d5eb53b6bf?w=800&q=80',
        mood: 'tense',
        choices: [
            {
                id: 'absorb_orb',
                text: 'Absorb the void orb',
                nextNodeId: 'depths',
                statChanges: { darkness: 12 },
                itemGain: 'Void Essence',
            },
            {
                id: 'leave_orb',
                text: 'Leave it and press onward',
                nextNodeId: 'daylight',
                statChanges: { light: 5, gaia: 3 },
            },
        ],
    },
    command_hollow: {
        id: 'command_hollow',
        text: 'You raise your hand, and the mark blazes to life. Dark fire licks along your arm as you speak words you don\'t consciously know—commands in the tongue of the Void.\n\nThe Hollow freezes. Its eyeless face tilts, confused. Then, slowly, horribly, it kneels. Its twisted body contorts into something resembling a bow.\n\nYou feel the connection—a thread of dark power linking your will to the creature\'s essence. It is yours to command. A servant of the Void, bent to the Architect\'s purpose.\n\nThe power is intoxicating. And terrifying. The mark on your chest pulses like a second heartbeat.\n\nSomewhere far away, something ancient takes notice.',
        sceneImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
        mood: 'dark',
        choices: [
            {
                id: 'keep_hollow',
                text: 'Bind the Hollow as your servant',
                nextNodeId: 'depths',
                statChanges: { darkness: 15 },
                itemGain: 'Bound Hollow',
            },
            {
                id: 'release_hollow',
                text: 'Release it and reject the Void\'s gift',
                nextNodeId: 'daylight',
                statChanges: { light: 10 },
            },
        ],
    },
    varen_alliance: {
        id: 'varen_alliance',
        text: 'Varen studies you for a long moment, then nods slowly.\n\n"You built the barriers between our world and the Void. You created the Crown—not a thing of gold and jewels, but a web of power that held reality together. The Consortium found a way to siphon that power. They grew rich while the barriers weakened."\n\nHe pulls his blade from the stone.\n\n"The Weaver came through the cracks. It wants to unmake everything—merge all worlds into the Void. The Consortium thinks they can control it. Fools."\n\nHe extends his hand.\n\n"I was your blade once. I will be again. But this time, Architect, we do things differently. No more ruling from the shadows. We fight in the open."\n\nVaren has joined your cause. The path forward is clearer now, but no less dangerous.',
        sceneImage: 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=800&q=80',
        speaker: 'Varen',
        speakerColor: '#c41e3d',
        mood: 'epic',
        choices: [
            {
                id: 'continue_journey',
                text: 'Continue the journey together',
                nextNodeId: 'chapter_end',
                statChanges: { light: 5, gaia: 5 },
            },
        ],
    },
    varen_test: {
        id: 'varen_test',
        text: 'Varen\'s jaw tightens, but he does not flinch.\n\n"Fair enough. You don\'t remember me, and trust is earned, not owed."\n\nHe draws his blade from the stone in one fluid motion and assumes a fighting stance.\n\n"I guarded this door against Hollows for years. Three hundred and forty-seven of them, by my count. If my blade isn\'t proof enough..."\n\nHe flips the weapon and offers you the hilt.\n\n"...then test me however you see fit, Architect. I followed you into the Void once before. I\'ll do it again."\n\nThe sincerity in his eyes is unmistakable. Scarred, weary, but unbroken.\n\nSometimes loyalty needs no proof beyond endurance.',
        sceneImage: 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=800&q=80',
        speaker: 'Varen',
        speakerColor: '#c41e3d',
        mood: 'tense',
        choices: [
            {
                id: 'accept_varen',
                text: 'Accept his loyalty',
                nextNodeId: 'chapter_end',
                statChanges: { darkness: 3, light: 3 },
                itemGain: 'Varen\'s Oath',
            },
        ],
    },
    elara_alliance: {
        id: 'elara_alliance',
        text: 'Elara takes your hands in hers. Green light flows between you, warm and alive, and for a moment you feel the pulse of the earth itself—vast, patient, wounded but enduring.\n\n"Your memories are not gone, Merunes. They are scattered, like seeds in a storm. I can help you find them, but it will take time, and it will hurt."\n\nShe leads you to the camp. Survivors—people displaced by the Consortium\'s greed and the Void\'s encroachment. They look at you with a mixture of hope and fear.\n\n"You were not just an architect of barriers," Elara says softly. "You were the architect of hope. The people need that again."\n\nShe places a hand over your mark. The burning eases, just slightly.\n\n"Gaia remembers you, even if you don\'t remember yourself. Let that be enough for now."',
        sceneImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
        speaker: 'Elara',
        speakerColor: '#3aad62',
        mood: 'warm',
        choices: [
            {
                id: 'continue_with_elara',
                text: 'Accept Elara\'s guidance',
                nextNodeId: 'chapter_end',
                statChanges: { light: 8, gaia: 10 },
            },
        ],
    },
    elara_lore: {
        id: 'elara_lore',
        text: 'Elara\'s expression darkens.\n\n"After you fell, the Consortium moved quickly. They claimed the Crown\'s power for themselves—fractured it, parceled it out among their leaders like spoils of war. They built their empire on stolen foundations."\n\nShe gestures at the bruised sky.\n\n"But power taken, not earned, always corrupts. The barriers you built began to fail. The Void seeped through—first as whispers, then as Hollows, now as tears in reality itself."\n\n"The Weaver orchestrates it all from the other side. It promised the Consortium control. What it gave them was a leash they cannot see."\n\nShe looks at you with fierce determination.\n\n"There is a third way, Merunes. Not the Crown alone, not the Void. Gaia itself—the living world—has its own power. Together, we can weave something new."',
        sceneImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
        speaker: 'Elara',
        speakerColor: '#3aad62',
        mood: 'tense',
        choices: [
            {
                id: 'join_elara',
                text: 'Join forces with Elara',
                nextNodeId: 'chapter_end',
                statChanges: { gaia: 10, light: 5 },
            },
        ],
    },
    chapter_end: {
        id: 'chapter_end',
        text: 'The first chapter of your awakening draws to a close. You are Merunes, the Architect—builder of barriers, keeper of the Crown, returned from death or something worse.\n\nThe road ahead is shrouded in darkness, but you are not alone. Allies wait to be found. Enemies scheme in towers of stolen power. And somewhere beyond the veil of reality, the Weaver watches, patient and hungry.\n\nThe mark on your chest burns with purpose now. Not pain—promise.\n\nYour story has only just begun.\n\n— End of Chapter One —',
        sceneImage: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&q=80',
        mood: 'epic',
        choices: [],
    },
};
