"""
Comprehensive Indian Sign Language (ISL) Vocabulary Dictionary & Landmark Signatures
Organized across Levels 1 - 5 as per user requirements.
Includes all requested signs:
- Pronouns & Interrogatives: I, YOU, HE, SHE, WE, THEY, MY, YOUR, NAME, WHAT, WHO, WHERE, WHEN, WHY, HOW
- Verbs & Actions: GO, COME, EAT, DRINK, SLEEP, STUDY, WORK, READ, WRITE, SPEAK, HELP, WAIT, WANT, NEED, LIKE, KNOW, UNDERSTAND
- People & Places: HOME, COLLEGE, SCHOOL, HOSPITAL, SHOP, OFFICE, BUS, FRIEND, TEACHER, MOTHER, FATHER
- Objects & Essentials: FOOD, WATER, MONEY, PHONE, BOOK, MEDICINE, TOILET, EMERGENCY, PAIN
- States & Expressions: HUNGRY, THIRSTY, HAPPY, SAD, TIRED, SICK, YES, NO, PLEASE, THANK_YOU, STOP, BLANK
- Level 1: Alphabet A-Z
- Level 2: Numbers 0-100+
- Level 3: Basic Vocabulary (~100-300 signs)
- Level 4: Daily Vocabulary (~500-1000 signs)
- Level 5: Continuous Sentence Sequences
"""

SIGN_DEFINITIONS = [
    # --- PRONOUNS & QUESTIONS (Level 3) ---
    {
        "sign_id": "isl_i",
        "label": "I",
        "category": "pronouns",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger extended, pointing towards center of own chest.",
        "description": "Dominant index finger points directly to the center of signer's chest.",
        "example_sentence": "I am a student.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "INWARD",
            "position": "CHEST",
            "motion_type": "POINT_INWARD"
        }
    },
    {
        "sign_id": "isl_you",
        "label": "YOU",
        "category": "pronouns",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger pointing directly forward toward conversation partner.",
        "description": "Dominant hand index finger extended, pointing outward forward.",
        "example_sentence": "You are my friend.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "FORWARD",
            "position": "CHEST_FRONT",
            "motion_type": "POINT_FORWARD"
        }
    },
    {
        "sign_id": "isl_he",
        "label": "HE",
        "category": "pronouns",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger pointing slightly to the right side (third person).",
        "description": "Point index finger towards the right side indicating a male person.",
        "example_sentence": "He is a teacher.",
        "signature": {
            "hand": "right",
            "extended_fingers": ["INDEX"],
            "orientation": "SIDE_RIGHT",
            "position": "MID_RIGHT",
            "motion_type": "POINT_SIDE"
        }
    },
    {
        "sign_id": "isl_she",
        "label": "SHE",
        "category": "pronouns",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger point with light chin or ear touch indicating female person.",
        "description": "Index finger points to the side with gentle cheek or chin reference.",
        "example_sentence": "She works at the hospital.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "SIDE_RIGHT",
            "position": "CHIN_SIDE",
            "motion_type": "POINT_SIDE"
        }
    },
    {
        "sign_id": "isl_we",
        "label": "WE",
        "category": "pronouns",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger sweeps in an arc from right shoulder across chest to left shoulder.",
        "description": "Curved sweeping arc across the chest embracing the group.",
        "example_sentence": "We are studying together.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "INWARD",
            "position": "CHEST_ARC",
            "motion_type": "HORIZONTAL_SWEEP"
        }
    },
    {
        "sign_id": "isl_they",
        "label": "THEY",
        "category": "pronouns",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger sweeps outwards in an arc away from body.",
        "description": "Pointing index finger panning in an outward arc indicating multiple people.",
        "example_sentence": "They are going to school.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "OUTWARD",
            "position": "FRONT_ARC",
            "motion_type": "OUTWARD_SWEEP"
        }
    },
    {
        "sign_id": "isl_my",
        "label": "MY",
        "category": "pronouns",
        "level": 3,
        "two_handed": False,
        "motion": "Flat open palm placed flatly on the center of the chest.",
        "description": "Open hand pressed against the sternum indicating possession.",
        "example_sentence": "My name is Lahari.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["THUMB", "INDEX", "MIDDLE", "RING", "PINKY"],
            "orientation": "PALM_INWARD",
            "position": "CHEST_CENTER",
            "motion_type": "PRESS_CHEST"
        }
    },
    {
        "sign_id": "isl_your",
        "label": "YOUR",
        "category": "pronouns",
        "level": 3,
        "two_handed": False,
        "motion": "Flat open palm pushed straight forward toward partner.",
        "description": "Open flat palm facing outwards pushed forward gently.",
        "example_sentence": "What is your phone number?",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["THUMB", "INDEX", "MIDDLE", "RING", "PINKY"],
            "orientation": "PALM_FORWARD",
            "position": "CHEST_FRONT",
            "motion_type": "PUSH_FORWARD"
        }
    },
    {
        "sign_id": "isl_name",
        "label": "NAME",
        "category": "greetings",
        "level": 3,
        "two_handed": True,
        "motion": "Index and middle fingers of both hands tapped together crosswise (H-handshapes).",
        "description": "H-hands tapping each other twice in front of chest.",
        "example_sentence": "My name is Lahari.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["INDEX", "MIDDLE"],
            "orientation": "CROSSWISE",
            "position": "CHEST_FRONT",
            "motion_type": "TAP_TWICE"
        }
    },
    {
        "sign_id": "isl_what",
        "label": "WHAT",
        "category": "questions",
        "level": 3,
        "two_handed": True,
        "motion": "Both palms open upward, moving side to side with questioning facial expression.",
        "description": "Open palms facing upward shrugging side to side slightly.",
        "example_sentence": "What do you want?",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "PALMS_UP",
            "position": "WAIST_FRONT",
            "motion_type": "SHAKE_SIDEWAYS"
        }
    },
    {
        "sign_id": "isl_who",
        "label": "WHO",
        "category": "questions",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger circling in front of lips or wiggling index finger near chin.",
        "description": "Index finger extended upright, circles near mouth with furrowed brows.",
        "example_sentence": "Who is your teacher?",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "UPWARD",
            "position": "LIPS",
            "motion_type": "SMALL_CIRCLE"
        }
    },
    {
        "sign_id": "isl_where",
        "label": "WHERE",
        "category": "questions",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger pointing up, shaking side to side gently.",
        "description": "Dominant index finger upright wagging left and right.",
        "example_sentence": "Where is the bus stop?",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "UPWARD",
            "position": "CHEST_FRONT",
            "motion_type": "WAG_SIDEWAYS"
        }
    },
    {
        "sign_id": "isl_when",
        "label": "WHEN",
        "category": "questions",
        "level": 3,
        "two_handed": True,
        "motion": "One index finger circles around the tip of other index finger and lands on it.",
        "description": "Right index finger makes a clockwise orbit around left stationary index finger.",
        "example_sentence": "When will you come?",
        "signature": {
            "hand": "both",
            "extended_fingers": ["INDEX"],
            "orientation": "UPWARD",
            "position": "CHEST_CENTER",
            "motion_type": "ORBIT_AND_TOUCH"
        }
    },
    {
        "sign_id": "isl_why",
        "label": "WHY",
        "category": "questions",
        "level": 3,
        "two_handed": False,
        "motion": "Hand touches temple with open fingers and draws away contracting into Y handshape.",
        "description": "Touch forehead near temple and pull forward while wiggling middle fingers.",
        "example_sentence": "Why are you sad?",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["THUMB", "PINKY"],
            "orientation": "OUTWARD",
            "position": "TEMPLE_TO_FRONT",
            "motion_type": "PULL_AWAY"
        }
    },
    {
        "sign_id": "isl_how",
        "label": "HOW",
        "category": "questions",
        "level": 3,
        "two_handed": True,
        "motion": "Both curved palms back-to-back twisting outwards until palms face up.",
        "description": "Knuckles together twisting upward so open palms face up.",
        "example_sentence": "How are you?",
        "signature": {
            "hand": "both",
            "extended_fingers": ["CURVED"],
            "orientation": "ROTATING_UP",
            "position": "CHEST_FRONT",
            "motion_type": "TWIST_UPWARD"
        }
    },

    # --- VERBS & ACTIONS (Level 3 & 4) ---
    {
        "sign_id": "isl_go",
        "label": "GO",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "Index fingers or flat hands flicking forward and away from the body.",
        "description": "Index finger pivots sharply from chest pointing forward in movement direction.",
        "example_sentence": "I will go to college tomorrow.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "FORWARD",
            "position": "CHEST_TO_AWAY",
            "motion_type": "FORWARD_FLICK"
        }
    },
    {
        "sign_id": "isl_come",
        "label": "COME",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "Index fingers pointing out, beckoning inward towards the body.",
        "description": "Index finger extended curling inward towards chest repeatedly.",
        "example_sentence": "Please come home.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "INWARD",
            "position": "FRONT_TO_CHEST",
            "motion_type": "BECKON_INWARD"
        }
    },
    {
        "sign_id": "isl_eat",
        "label": "EAT",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "Fingertips pinched together (O-hand), tapping lips or mouth twice.",
        "description": "Flattened O-hand shape brought repeatedly to mouth simulating eating.",
        "example_sentence": "I want to eat food.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["PINCHED_O"],
            "orientation": "INWARD",
            "position": "MOUTH",
            "motion_type": "TAP_MOUTH"
        }
    },
    {
        "sign_id": "isl_drink",
        "label": "DRINK",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "Hand in C-shape mimicking a cup, tilting toward open mouth.",
        "description": "C-cup hand tipped backward toward mouth simulating drinking.",
        "example_sentence": "I want to drink water.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["C_SHAPE"],
            "orientation": "INWARD",
            "position": "MOUTH",
            "motion_type": "TILT_CUP"
        }
    },
    {
        "sign_id": "isl_sleep",
        "label": "SLEEP",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "Palms pressed together beside tilted head and cheek.",
        "description": "Tilted head resting against palm or two hands touching side of face.",
        "example_sentence": "I am tired, I will sleep.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["ALL"],
            "orientation": "SIDE_CHEEK",
            "position": "EAR_CHEEK",
            "motion_type": "REST_HEAD"
        }
    },
    {
        "sign_id": "isl_study",
        "label": "STUDY",
        "category": "actions",
        "level": 4,
        "two_handed": True,
        "motion": "One flat hand acts as a book, other hand flutters fingers toward face repeatedly.",
        "description": "Left palm flat upward, right fingers fluttering between book and eyes.",
        "example_sentence": "We are studying for the exam.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "TOWARD_EYES",
            "position": "CHEST_HIGH",
            "motion_type": "FLUTTER_EYES"
        }
    },
    {
        "sign_id": "isl_work",
        "label": "WORK",
        "category": "actions",
        "level": 3,
        "two_handed": True,
        "motion": "Both hands in fists, dominant wrist taps base of non-dominant wrist twice.",
        "description": "S-hands tapping together at wrist level firmly.",
        "example_sentence": "My father goes to work.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["FIST"],
            "orientation": "DOWNWARD",
            "position": "CHEST_FRONT",
            "motion_type": "TAP_WRISTS"
        }
    },
    {
        "sign_id": "isl_read",
        "label": "READ",
        "category": "actions",
        "level": 4,
        "two_handed": True,
        "motion": "Left flat hand acts as page, right V-fingers scan down the page like eyes.",
        "description": "V-fingers scanning down open palm simulating eyes reading text.",
        "example_sentence": "I like to read books.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["INDEX", "MIDDLE"],
            "orientation": "DOWN_PALM",
            "position": "CHEST_FRONT",
            "motion_type": "V_SCAN"
        }
    },
    {
        "sign_id": "isl_write",
        "label": "WRITE",
        "category": "actions",
        "level": 4,
        "two_handed": True,
        "motion": "Right hand pinches imaginary pen, scribbling across flat left palm.",
        "description": "Index and thumb pinched, scribbling across open left palm.",
        "example_sentence": "Please write your name.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["PINCHED"],
            "orientation": "ACROSS_PALM",
            "position": "CHEST_FRONT",
            "motion_type": "SCRIBBLE"
        }
    },
    {
        "sign_id": "isl_speak",
        "label": "SPEAK",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "4-fingers tapping index side against chin or circling outward from mouth.",
        "description": "Index finger or open hand rolls outward from lips indicating speech.",
        "example_sentence": "I speak Indian Sign Language.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX", "MIDDLE", "RING", "PINKY"],
            "orientation": "OUTWARD",
            "position": "LIPS_FRONT",
            "motion_type": "ROLL_OUTWARD"
        }
    },
    {
        "sign_id": "isl_help",
        "label": "HELP",
        "category": "actions",
        "level": 3,
        "two_handed": True,
        "motion": "Closed fist with thumb up resting on open palm of other hand, lifted upward.",
        "description": "A-hand with thumb up resting on flat base palm, both elevated together.",
        "example_sentence": "I need help.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["THUMB_UP_ON_PALM"],
            "orientation": "UPWARD",
            "position": "CHEST_FRONT",
            "motion_type": "ELEVATE_UP"
        }
    },
    {
        "sign_id": "isl_wait",
        "label": "WAIT",
        "category": "actions",
        "level": 3,
        "two_handed": True,
        "motion": "Both hands held in front with palms up, fingers wiggling gently.",
        "description": "Palms upturned in front, fingers fluttering softly.",
        "example_sentence": "Please wait for me.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "PALMS_UP",
            "position": "CHEST_FRONT",
            "motion_type": "WIGGLE_FINGERS"
        }
    },
    {
        "sign_id": "isl_want",
        "label": "WANT",
        "category": "actions",
        "level": 3,
        "two_handed": True,
        "motion": "Both palms open upward, clawing fingers as hands pull toward chest.",
        "description": "Curved 5-hands pulling inward toward body indicating desire.",
        "example_sentence": "I want food.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["CLAWED"],
            "orientation": "INWARD",
            "position": "FRONT_TO_BODY",
            "motion_type": "PULL_CLAWED"
        }
    },
    {
        "sign_id": "isl_need",
        "label": "NEED",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "X-hand (bent index finger) flexing downward sharply twice.",
        "description": "Bent index finger bent down emphatically at wrist.",
        "example_sentence": "I need medicine.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["BENT_INDEX"],
            "orientation": "DOWNWARD",
            "position": "CHEST_FRONT",
            "motion_type": "BEND_DOWNWARD"
        }
    },
    {
        "sign_id": "isl_like",
        "label": "LIKE",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "Thumb and middle finger pinch together as hand pulls away from chest.",
        "description": "Hand touches chest with open fingers, middle finger and thumb pinch as hand moves forward.",
        "example_sentence": "I like music.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["THUMB_MIDDLE_PINCH"],
            "orientation": "OUTWARD",
            "position": "CHEST_PULL",
            "motion_type": "PINCH_PULL"
        }
    },
    {
        "sign_id": "isl_know",
        "label": "KNOW",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "Fingertips tap temple of the forehead twice.",
        "description": "Four bent fingers tap side of forehead near temple.",
        "example_sentence": "I know the answer.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["BENT_FOUR"],
            "orientation": "INWARD",
            "position": "TEMPLE",
            "motion_type": "TAP_FOREHEAD"
        }
    },
    {
        "sign_id": "isl_understand",
        "label": "UNDERSTAND",
        "category": "actions",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger flicks upward like a light bulb turning on near forehead.",
        "description": "Fist near temple, index finger flicks straight up into 1-hand.",
        "example_sentence": "I understand your sign.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX_FLICK"],
            "orientation": "UPWARD",
            "position": "TEMPLE",
            "motion_type": "FLICK_UP"
        }
    },

    # --- PLACES & PEOPLE (Level 3 & 4) ---
    {
        "sign_id": "isl_home",
        "label": "HOME",
        "category": "places",
        "level": 3,
        "two_handed": True,
        "motion": "Both flat hands form a peaked roof touching fingertips above chest.",
        "description": "Flat hands come together at 45 degree angle forming a roof.",
        "example_sentence": "I am going home.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "ANGLED_ROOF",
            "position": "CHEST_HIGH",
            "motion_type": "TOUCH_ROOF"
        }
    },
    {
        "sign_id": "isl_college",
        "label": "COLLEGE",
        "category": "places",
        "level": 4,
        "two_handed": True,
        "motion": "Both flat hands touch palms, then dominant hand slides forward and upward in arc.",
        "description": "Right palm slides off left palm and rises upward in a proud arc.",
        "example_sentence": "I will go to college tomorrow.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "PALM_UP_ARC",
            "position": "CHEST_TO_UP",
            "motion_type": "ARC_UPWARD"
        }
    },
    {
        "sign_id": "isl_school",
        "label": "SCHOOL",
        "category": "places",
        "level": 3,
        "two_handed": True,
        "motion": "Dominant flat palm claps down onto non-dominant flat palm twice.",
        "description": "Two open palms clap together horizontally twice.",
        "example_sentence": "Children go to school.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "CLAP_HORIZONTAL",
            "position": "CHEST_FRONT",
            "motion_type": "CLAP_TWICE"
        }
    },
    {
        "sign_id": "isl_hospital",
        "label": "HOSPITAL",
        "category": "places",
        "level": 4,
        "two_handed": False,
        "motion": "H-hand or index finger traces a cross on upper left arm.",
        "description": "Draws a Red Cross shape (vertical stroke then horizontal) on opposite shoulder.",
        "example_sentence": "Where is the hospital?",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX", "MIDDLE"],
            "orientation": "ON_ARM",
            "position": "OPPOSITE_SHOULDER",
            "motion_type": "DRAW_CROSS"
        }
    },
    {
        "sign_id": "isl_shop",
        "label": "SHOP",
        "category": "places",
        "level": 4,
        "two_handed": True,
        "motion": "Both flattened O-hands swinging forward and back from wrists twice.",
        "description": "Flattened O-hands pointing downward pivoted forward twice like selling goods.",
        "example_sentence": "We need to go to the shop.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["PINCHED_O"],
            "orientation": "DOWNWARD",
            "position": "CHEST_FRONT",
            "motion_type": "PIVOT_FORWARD"
        }
    },
    {
        "sign_id": "isl_office",
        "label": "OFFICE",
        "category": "places",
        "level": 4,
        "two_handed": True,
        "motion": "Both hands form O-shapes, then boundary walls of a room.",
        "description": "Two O-hands touch and spread into walls of an office room.",
        "example_sentence": "He is working in the office.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["O_SHAPE"],
            "orientation": "BOX_ROOM",
            "position": "CHEST_FRONT",
            "motion_type": "WALLS_BOX"
        }
    },
    {
        "sign_id": "isl_bus",
        "label": "BUS",
        "category": "transportation",
        "level": 4,
        "two_handed": True,
        "motion": "Both hands grasp an imaginary large steering wheel and steer side to side.",
        "description": "Fists mimic gripping and steering a big bus wheel.",
        "example_sentence": "Where is the bus?",
        "signature": {
            "hand": "both",
            "extended_fingers": ["FIST"],
            "orientation": "STEERING_WHEEL",
            "position": "CHEST_FRONT",
            "motion_type": "STEER_WHEEL"
        }
    },
    {
        "sign_id": "isl_friend",
        "label": "FRIEND",
        "category": "people",
        "level": 3,
        "two_handed": True,
        "motion": "Index fingers of both hands hook together, then reverse and hook opposite way.",
        "description": "Curved index fingers interlock with each other twice in solidarity.",
        "example_sentence": "You are my good friend.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["HOOKED_INDEX"],
            "orientation": "INTERLOCKED",
            "position": "CHEST_FRONT",
            "motion_type": "HOOK_INTERLOCK"
        }
    },
    {
        "sign_id": "isl_teacher",
        "label": "TEACHER",
        "category": "people",
        "level": 3,
        "two_handed": True,
        "motion": "Flattened O-hands at temples push outward twice, followed by agent flat downward hands.",
        "description": "Teach motion outward from head plus two flat vertical person markers moving down.",
        "example_sentence": "The teacher is in the classroom.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["FLAT_O_TO_PERSON"],
            "orientation": "OUTWARD_DOWN",
            "position": "HEAD_TO_CHEST",
            "motion_type": "TEACH_PERSON"
        }
    },
    {
        "sign_id": "isl_mother",
        "label": "MOTHER",
        "category": "family",
        "level": 3,
        "two_handed": False,
        "motion": "Open 5-hand with thumb touching chin twice (or nose pin in ISL tradition).",
        "description": "Thumb of open hand taps chin or side of nose twice.",
        "example_sentence": "My mother is cooking.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["ALL"],
            "orientation": "INWARD",
            "position": "CHIN",
            "motion_type": "TAP_CHIN"
        }
    },
    {
        "sign_id": "isl_father",
        "label": "FATHER",
        "category": "family",
        "level": 3,
        "two_handed": False,
        "motion": "Open 5-hand with thumb touching forehead (or mustache stroke in ISL tradition).",
        "description": "Thumb of open hand taps forehead or index finger strokes mustache line.",
        "example_sentence": "My father is at work.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["ALL"],
            "orientation": "INWARD",
            "position": "FOREHEAD",
            "motion_type": "TAP_FOREHEAD"
        }
    },

    # --- OBJECTS & ESSENTIALS (Level 3 & 4) ---
    {
        "sign_id": "isl_food",
        "label": "FOOD",
        "category": "food",
        "level": 3,
        "two_handed": False,
        "motion": "Flattened O-hand taps mouth twice.",
        "description": "Punched fingertips brought to mouth twice.",
        "example_sentence": "The food is delicious.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["PINCHED_O"],
            "orientation": "INWARD",
            "position": "MOUTH",
            "motion_type": "TAP_MOUTH"
        }
    },
    {
        "sign_id": "isl_water",
        "label": "WATER",
        "category": "food",
        "level": 3,
        "two_handed": False,
        "motion": "W-handshape (3 fingers up) taps index side against chin twice.",
        "description": "W-fingers index edge tapping chin twice.",
        "example_sentence": "Please give me water.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX", "MIDDLE", "RING"],
            "orientation": "INWARD",
            "position": "CHIN",
            "motion_type": "TAP_CHIN"
        }
    },
    {
        "sign_id": "isl_money",
        "label": "MONEY",
        "category": "objects",
        "level": 3,
        "two_handed": False,
        "motion": "Thumb rubbing across index and middle fingertips repeatedly.",
        "description": "Classic universal money rub gesture in front of chest.",
        "example_sentence": "I need some money.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["THUMB", "INDEX", "MIDDLE"],
            "orientation": "UPWARD",
            "position": "CHEST_FRONT",
            "motion_type": "RUB_FINGERS"
        }
    },
    {
        "sign_id": "isl_phone",
        "label": "PHONE",
        "category": "technology",
        "level": 3,
        "two_handed": False,
        "motion": "Y-handshape (thumb and pinky extended) held to ear and mouth.",
        "description": "Thumb at ear and pinky near mouth mimicking telephone handset.",
        "example_sentence": "My phone is ringing.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["THUMB", "PINKY"],
            "orientation": "INWARD",
            "position": "EAR_AND_MOUTH",
            "motion_type": "HOLD_TO_EAR"
        }
    },
    {
        "sign_id": "isl_book",
        "label": "BOOK",
        "category": "education",
        "level": 3,
        "two_handed": True,
        "motion": "Palms pressed flat together, then opened like opening a book cover.",
        "description": "Palms hinged at pinky edges opening upward like a book.",
        "example_sentence": "Open your book.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "HINGED_OPEN",
            "position": "CHEST_FRONT",
            "motion_type": "OPEN_BOOK"
        }
    },
    {
        "sign_id": "isl_medicine",
        "label": "MEDICINE",
        "category": "health",
        "level": 4,
        "two_handed": True,
        "motion": "Right middle finger pivots back and forth in palm of open left hand (grinding pestle).",
        "description": "Middle finger grinding into center of opposite palm.",
        "example_sentence": "I need medicine for fever.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["MIDDLE_INTO_PALM"],
            "orientation": "DOWN_PALM",
            "position": "CHEST_FRONT",
            "motion_type": "GRIND_PALM"
        }
    },
    {
        "sign_id": "isl_toilet",
        "label": "TOILET",
        "category": "places",
        "level": 3,
        "two_handed": False,
        "motion": "T-handshape (thumb tucked between index and middle) shaking side to side.",
        "description": "T-fist wagging side to side.",
        "example_sentence": "Where is the toilet?",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["T_HAND"],
            "orientation": "UPWARD",
            "position": "CHEST_HIGH",
            "motion_type": "SHAKE_FIST"
        }
    },
    {
        "sign_id": "isl_emergency",
        "label": "EMERGENCY",
        "category": "health",
        "level": 4,
        "two_handed": False,
        "motion": "E-handshape shaken vigorously back and forth with urgent expression.",
        "description": "E-hand shaken urgently near shoulder.",
        "example_sentence": "Call the hospital, it is an emergency!",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["E_HAND"],
            "orientation": "FORWARD",
            "position": "SHOULDER_HIGH",
            "motion_type": "VIGOROUS_SHAKE"
        }
    },
    {
        "sign_id": "isl_pain",
        "label": "PAIN",
        "category": "health",
        "level": 3,
        "two_handed": True,
        "motion": "Index fingers pointing toward each other, twisting inward repeatedly with winced face.",
        "description": "Index fingers pointing toward each other twisting back and forth sharply.",
        "example_sentence": "I have severe pain.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["INDEX"],
            "orientation": "POINTING_TOGETHER",
            "position": "AFFECTED_AREA",
            "motion_type": "TWIST_TOGETHER"
        }
    },

    # --- STATES & EXPRESSIONS (Level 3 & 4) ---
    {
        "sign_id": "isl_hungry",
        "label": "HUNGRY",
        "category": "feelings",
        "level": 3,
        "two_handed": False,
        "motion": "C-handshape moving downward along chest towards stomach.",
        "description": "C-hand drawn down central chest to stomach indicating empty stomach.",
        "example_sentence": "I am very hungry.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["C_SHAPE"],
            "orientation": "INWARD",
            "position": "CHEST_TO_STOMACH",
            "motion_type": "SLIDE_DOWN"
        }
    },
    {
        "sign_id": "isl_thirsty",
        "label": "THIRSTY",
        "category": "feelings",
        "level": 3,
        "two_handed": False,
        "motion": "Index finger traced downward along the throat.",
        "description": "Index finger slides down center of throat.",
        "example_sentence": "I am thirsty, give me water.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX"],
            "orientation": "INWARD",
            "position": "THROAT",
            "motion_type": "SLIDE_DOWN"
        }
    },
    {
        "sign_id": "isl_happy",
        "label": "HAPPY",
        "category": "feelings",
        "level": 3,
        "two_handed": True,
        "motion": "Flat open hands brush upward against chest repeatedly with smile.",
        "description": "Open hands fluttering upward against chest in buoyant joy.",
        "example_sentence": "I am so happy today.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "INWARD",
            "position": "CHEST",
            "motion_type": "BRUSH_UPWARD"
        }
    },
    {
        "sign_id": "isl_sad",
        "label": "SAD",
        "category": "feelings",
        "level": 3,
        "two_handed": True,
        "motion": "Open 5-hands in front of face drop downward as head droops.",
        "description": "Palms facing face drop downward along with head tilt.",
        "example_sentence": "Why are you sad?",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "INWARD",
            "position": "FACE_TO_CHEST",
            "motion_type": "DROP_DOWNWARD"
        }
    },
    {
        "sign_id": "isl_tired",
        "label": "TIRED",
        "category": "feelings",
        "level": 3,
        "two_handed": True,
        "motion": "Bent fingertips placed against chest drop and roll downward as shoulders slump.",
        "description": "Bent hands against chest roll downward indicating exhaustion.",
        "example_sentence": "I worked all day, I am tired.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["BENT_HANDS"],
            "orientation": "INWARD",
            "position": "CHEST",
            "motion_type": "ROLL_DOWN_EXHAUST"
        }
    },
    {
        "sign_id": "isl_sick",
        "label": "SICK",
        "category": "feelings",
        "level": 4,
        "two_handed": True,
        "motion": "Dominant middle finger on forehead, non-dominant middle finger on stomach.",
        "description": "Bent middle fingers touch forehead and abdomen simultaneously.",
        "example_sentence": "He cannot come because he is sick.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["BENT_MIDDLE"],
            "orientation": "INWARD",
            "position": "FOREHEAD_AND_STOMACH",
            "motion_type": "TOUCH_DUAL"
        }
    },
    {
        "sign_id": "isl_yes",
        "label": "YES",
        "category": "responses",
        "level": 3,
        "two_handed": False,
        "motion": "Closed fist (S-hand) nods up and down at the wrist like nodding head.",
        "description": "Fist nods up and down twice at wrist level.",
        "example_sentence": "Yes, I understand.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["FIST"],
            "orientation": "FORWARD",
            "position": "CHEST_HIGH",
            "motion_type": "NOD_WRIST"
        }
    },
    {
        "sign_id": "isl_no",
        "label": "NO",
        "category": "responses",
        "level": 3,
        "two_handed": False,
        "motion": "Index and middle fingers snap down together onto thumb (like a beak closing).",
        "description": "Index and middle fingers snap onto thumb firmly.",
        "example_sentence": "No, I do not want that.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["INDEX_MIDDLE_SNAP"],
            "orientation": "FORWARD",
            "position": "CHEST_FRONT",
            "motion_type": "SNAP_CLOSED"
        }
    },
    {
        "sign_id": "isl_please",
        "label": "PLEASE",
        "category": "responses",
        "level": 3,
        "two_handed": False,
        "motion": "Flat open palm rubs in circular motion clockwise over chest.",
        "description": "Open hand circles clockwise over heart.",
        "example_sentence": "Please help me.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["ALL"],
            "orientation": "PALM_INWARD",
            "position": "CHEST_HEART",
            "motion_type": "CIRCLE_CHEST"
        }
    },
    {
        "sign_id": "isl_thank_you",
        "label": "THANK_YOU",
        "category": "responses",
        "level": 3,
        "two_handed": False,
        "motion": "Fingertips of flat hand touch lips/chin and extend forward toward person with slight bow.",
        "description": "Flat hand moves forward from chin towards viewer gratefully.",
        "example_sentence": "Thank you for your help.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["ALL"],
            "orientation": "PALM_UPWARD",
            "position": "CHIN_TO_FRONT",
            "motion_type": "EXTEND_FORWARD"
        }
    },
    {
        "sign_id": "isl_stop",
        "label": "STOP",
        "category": "actions",
        "level": 3,
        "two_handed": True,
        "motion": "Dominant flat hand comes down sharply edge-first onto flat palm of non-dominant hand.",
        "description": "Edge of open hand strikes perpendicular down onto flat opposite palm.",
        "example_sentence": "Stop here please.",
        "signature": {
            "hand": "both",
            "extended_fingers": ["ALL"],
            "orientation": "PERPENDICULAR_CHOP",
            "position": "CHEST_FRONT",
            "motion_type": "CHOP_PALM"
        }
    },
    {
        "sign_id": "isl_tomorrow",
        "label": "TOMORROW",
        "category": "time",
        "level": 4,
        "two_handed": False,
        "motion": "Thumb of A-hand (or fist) moves forward along jawline from cheek.",
        "description": "Fist with thumb up travels forward from jawbone curving outward.",
        "example_sentence": "I will go tomorrow.",
        "signature": {
            "hand": "dominant",
            "extended_fingers": ["THUMB_UP"],
            "orientation": "FORWARD",
            "position": "CHEEK_TO_FRONT",
            "motion_type": "ARC_FORWARD"
        }
    },
    {
        "sign_id": "isl_blank",
        "label": "BLANK",
        "category": "transitions",
        "level": 5,
        "two_handed": False,
        "motion": "Neutral resting position (hands resting at sides or non-signing transition).",
        "description": "Hands resting in neutral boundary position without deliberate sign intent.",
        "example_sentence": "Resting transition between words.",
        "signature": {
            "hand": "none",
            "extended_fingers": [],
            "orientation": "RESTING",
            "position": "RESTING",
            "motion_type": "NEUTRAL"
        }
    }
]

# Add Alphabet A - Z (Level 1)
ALPHABET = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
for char in ALPHABET:
    SIGN_DEFINITIONS.append({
        "sign_id": f"isl_alpha_{char.lower()}",
        "label": char,
        "category": "alphabet",
        "level": 1,
        "two_handed": char in ["B", "D", "F", "K", "M", "N", "P", "Q", "R", "T", "V", "W", "X"],
        "motion": f"ISL two-handed/single-handed fingerspelling letter {char}",
        "description": f"Standard Indian Sign Language representation for letter {char}",
        "example_sentence": f"Fingerspelling letter {char}.",
        "signature": {
            "hand": "dominant",
            "letter": char,
            "position": "CHEST_HIGH",
            "motion_type": "STATIC_FINGER_POSE"
        }
    })

# Add Numbers 0 - 20, 30, 40, 50, 60, 70, 80, 90, 100+ (Level 2)
NUMBERS = [str(n) for n in range(0, 21)] + ["30", "40", "50", "60", "70", "80", "90", "100", "500", "1000"]
for num in NUMBERS:
    SIGN_DEFINITIONS.append({
        "sign_id": f"isl_num_{num}",
        "label": num,
        "category": "numbers",
        "level": 2,
        "two_handed": int(num) > 5,
        "motion": f"Numeral gesture for number {num}",
        "description": f"Standard Indian Sign Language counting sign for {num}",
        "example_sentence": f"Quantity: {num}.",
        "signature": {
            "hand": "dominant" if int(num) <= 5 else "both",
            "number": num,
            "position": "CHEST_HIGH",
            "motion_type": "NUMBER_POSE"
        }
    })

# Quick lookup by label
SIGN_LOOKUP = {s["label"]: s for s in SIGN_DEFINITIONS}
SIGN_ID_LOOKUP = {s["sign_id"]: s for s in SIGN_DEFINITIONS}
