import re
from typing import List, Tuple, Dict, Any, Optional

class ISLLanguageTranslator:
    """
    Translates raw continuous Indian Sign Language (ISL) gloss sequences
    into natural, grammatically correct English sentences.
    ISL commonly follows Object-Subject-Verb (OSV), Topic-Comment, or telegraphic sequences.
    This translation layer:
    1. Removes filler/transitional tokens like BLANK
    2. Identifies question patterns, tense markers, modality, and pronouns
    3. Inflects verbs and inserts appropriate prepositions, auxiliary verbs, and articles
    4. Segments sentences on temporal pauses / boundary tokens
    """

    def __init__(self):
        # Known sentence idiomatic patterns and templates
        self.exact_patterns = {
            ("I", "GO", "COLLEGE", "TOMORROW"): "I will go to college tomorrow.",
            ("I", "GO", "COLLEGE"): "I am going to college.",
            ("I", "GO", "SCHOOL"): "I am going to school.",
            ("I", "GO", "HOME"): "I am going home.",
            ("I", "GO", "HOSPITAL"): "I am going to the hospital.",
            ("I", "GO", "WORK"): "I am going to work.",
            ("I", "GO", "SHOP"): "I am going to the shop.",
            ("HELLO", "MY", "NAME", "LAHARI"): "Hello, my name is Lahari.",
            ("MY", "NAME", "LAHARI"): "My name is Lahari.",
            ("I", "STUDENT"): "I am a student.",
            ("I", "TEACHER"): "I am a teacher.",
            ("WHERE", "BUS"): "Where is the bus stop?",
            ("WHERE", "HOSPITAL"): "Where is the hospital?",
            ("WHERE", "TOILET"): "Where is the toilet / restroom?",
            ("WHERE", "COLLEGE"): "Where is the college?",
            ("WHERE", "SCHOOL"): "Where is the school?",
            ("WHERE", "HOME"): "Where is your home?",
            ("I", "NEED", "HELP"): "I need help.",
            ("PLEASE", "HELP"): "Please help me.",
            ("PLEASE", "HELP", "ME"): "Please help me.",
            ("I", "LIKE", "MUSIC"): "I like music.",
            ("YOU", "LIKE", "MUSIC"): "Do you like music?",
            ("YOU", "LIKE", "MUSIC", "WHAT"): "What music do you like?",
            ("I", "HUNGRY", "WANT", "FOOD"): "I am hungry and I want food.",
            ("I", "HUNGRY"): "I am hungry.",
            ("I", "THIRSTY", "WANT", "WATER"): "I am thirsty and I want water.",
            ("I", "THIRSTY"): "I am thirsty.",
            ("WATER", "PLEASE"): "May I have some water, please?",
            ("FOOD", "PLEASE"): "May I have some food, please?",
            ("HELP", "PLEASE"): "Please help me.",
            ("WHERE", "HOSPITAL", "EMERGENCY"): "Where is the hospital? It is an emergency.",
            ("EMERGENCY", "NEED", "HELP"): "This is an emergency, I need help!",
            ("I", "PAIN", "NEED", "MEDICINE"): "I am in pain and I need medicine.",
            ("I", "HAVE", "PAIN"): "I am experiencing pain.",
            ("I", "PAIN"): "I am in pain.",
            ("I", "SICK"): "I am sick.",
            ("I", "TIRED"): "I am tired.",
            ("I", "HAPPY"): "I am happy.",
            ("I", "SAD"): "I am sad.",
            ("WHY", "YOU", "SAD"): "Why are you sad?",
            ("WHY", "YOU", "HAPPY"): "Why are you happy?",
            ("HOW", "YOU"): "How are you?",
            ("WHAT", "YOUR", "NAME"): "What is your name?",
            ("WHO", "YOU"): "Who are you?",
            ("WHO", "HE"): "Who is he?",
            ("WHO", "SHE"): "Who is she?",
            ("THANK_YOU", "FRIEND"): "Thank you, my friend.",
            ("THANK_YOU"): "Thank you very much.",
            ("PLEASE", "WAIT"): "Please wait a moment.",
            ("STOP", "WAIT"): "Please stop and wait.",
            ("STOP"): "Please stop.",
            ("YES", "UNDERSTAND"): "Yes, I understand.",
            ("NO", "UNDERSTAND"): "No, I do not understand.",
            ("I", "UNDERSTAND"): "I understand.",
            ("I", "KNOW"): "I know.",
            ("I", "WANT", "WATER"): "I want water.",
            ("I", "WANT", "FOOD"): "I want food.",
            ("I", "WANT", "SLEEP"): "I want to sleep.",
            ("WE", "STUDY"): "We are studying.",
            ("WE", "WORK"): "We are working.",
            ("THEY", "COME"): "They are coming.",
            ("THEY", "GO"): "They are leaving.",
            ("MOTHER", "HOME"): "Mother is at home.",
            ("FATHER", "WORK"): "Father is at work.",
            ("PHONE", "RING"): "The phone is ringing."
        }

    def clean_glosses(self, glosses: List[str]) -> List[str]:
        """Strip BLANK, empty, and consecutive duplicates in sequence."""
        cleaned = []
        last = None
        for g in glosses:
            g_upper = g.strip().upper()
            if not g_upper or g_upper in ["BLANK", "NONE", "IDLE"]:
                continue
            if g_upper != last:
                cleaned.append(g_upper)
                last = g_upper
        return cleaned

    def translate_sequence(self, raw_glosses: List[str], confidence: float = 0.90) -> str:
        """
        Translates a sequence of ISL glosses into fluent English.
        """
        glosses = self.clean_glosses(raw_glosses)
        if not glosses:
            return ""

        # Check exact multi-token pattern match
        tuple_key = tuple(glosses)
        if tuple_key in self.exact_patterns:
            return self.exact_patterns[tuple_key]

        # Check sub-sequences or grammatical rule translation
        return self._rule_based_synthesis(glosses)

    def _rule_based_synthesis(self, glosses: List[str]) -> str:
        """
        Applies linguistic synthesis rules for ISL to English translation.
        """
        n = len(glosses)
        has_tomorrow = "TOMORROW" in glosses
        is_question = any(q in glosses for q in ["WHAT", "WHERE", "WHEN", "WHY", "HOW", "WHO"])
        
        # Check pronoun subjects
        subject = "I"
        subject_verb_be = "am"
        subject_verb_have = "have"
        
        if "YOU" in glosses:
            subject = "You"
            subject_verb_be = "are"
            subject_verb_have = "have"
        elif "HE" in glosses:
            subject = "He"
            subject_verb_be = "is"
            subject_verb_have = "has"
        elif "SHE" in glosses:
            subject = "She"
            subject_verb_be = "is"
            subject_verb_have = "has"
        elif "WE" in glosses:
            subject = "We"
            subject_verb_be = "are"
            subject_verb_have = "have"
        elif "THEY" in glosses:
            subject = "They"
            subject_verb_be = "are"
            subject_verb_have = "have"
        elif "MY" in glosses and "NAME" in glosses:
            # Check if name follows
            idx = glosses.index("NAME")
            if idx + 1 < n:
                name_val = glosses[idx + 1].capitalize()
                return f"My name is {name_val}."
            return "My name is..."

        # Destination or Movement
        places = {"COLLEGE": "to college", "SCHOOL": "to school", "HOME": "home", 
                  "HOSPITAL": "to the hospital", "SHOP": "to the shop", "OFFICE": "to the office"}
        
        for p_key, p_val in places.items():
            if p_key in glosses and "GO" in glosses:
                if has_tomorrow:
                    return f"{subject} will go {p_val} tomorrow."
                return f"{subject} {subject_verb_be} going {p_val}."

        # Questions
        if "WHERE" in glosses:
            for p_key, p_val in places.items():
                if p_key in glosses:
                    place_name = p_key.lower()
                    if place_name == "home":
                        return "Where is your home?"
                    return f"Where is the {place_name}?"
            if "BUS" in glosses:
                return "Where is the bus stop?"
            if "TOILET" in glosses:
                return "Where is the restroom / toilet?"
            return "Where is it located?"

        if "WHAT" in glosses:
            if "NAME" in glosses:
                return "What is your name?"
            if "WANT" in glosses:
                return "What do you want?"
            return "What is that?"

        if "HOW" in glosses:
            if "YOU" in glosses:
                return "How are you doing?"
            return "How does this work?"

        if "WHY" in glosses:
            if "SAD" in glosses:
                return f"Why {subject_verb_be.lower()} you sad?"
            if "HAPPY" in glosses:
                return f"Why {subject_verb_be.lower()} you happy?"
            return "Why is that?"

        # Feelings / States
        feelings = {"HUNGRY": "hungry", "THIRSTY": "thirsty", "HAPPY": "happy", 
                    "SAD": "sad", "TIRED": "tired", "SICK": "sick"}
        for f_key, f_val in feelings.items():
            if f_key in glosses:
                if "WANT" in glosses and "FOOD" in glosses:
                    return f"{subject} {subject_verb_be} {f_val} and want some food."
                if "WANT" in glosses and "WATER" in glosses:
                    return f"{subject} {subject_verb_be} {f_val} and want water."
                return f"{subject} {subject_verb_be} {f_val}."

        # Needs and Actions
        if "NEED" in glosses:
            if "HELP" in glosses:
                return f"{subject} need help."
            if "MEDICINE" in glosses:
                return f"{subject} need medicine."
            if "WATER" in glosses:
                return f"{subject} need water."
            if "FOOD" in glosses:
                return f"{subject} need food."
            return f"{subject} need assistance."

        if "WANT" in glosses:
            if "FOOD" in glosses or "EAT" in glosses:
                return f"{subject} want to eat."
            if "WATER" in glosses or "DRINK" in glosses:
                return f"{subject} want to drink water."
            if "SLEEP" in glosses:
                return f"{subject} want to sleep."
            return f"{subject} want this."

        if "PAIN" in glosses:
            if "EMERGENCY" in glosses:
                return "Severe pain emergency! Please assist."
            return f"{subject} {subject_verb_have} pain."

        if "PLEASE" in glosses and "HELP" in glosses:
            return "Please help me."

        if "THANK_YOU" in glosses:
            return "Thank you so much."

        # Fallback synthesis: join words capitalized into readable clause
        readable = " ".join([w.capitalize() for w in glosses])
        return f"{readable}."

    def segment_sentences(self, sign_events: List[Dict[str, Any]], pause_threshold: float = 1.3) -> List[Dict[str, Any]]:
        """
        Splits a continuous stream of recognized signs into discrete sentences
        based on temporal pauses, punctuation markers, and question particles.
        """
        if not sign_events:
            return []

        sentences = []
        current_signs = []
        current_confidences = []
        last_time = sign_events[0].get("timestamp", 0)

        for event in sign_events:
            sign = event.get("sign", "").strip().upper()
            t = event.get("timestamp", last_time)
            conf = event.get("confidence", 0.9)

            if not sign or sign in ["BLANK", "NONE"]:
                # If hands rested long enough, complete current sentence
                if t - last_time > pause_threshold and current_signs:
                    english = self.translate_sequence(current_signs, sum(current_confidences)/len(current_confidences))
                    sentences.append({
                        "signs": list(current_signs),
                        "english": english,
                        "confidence": sum(current_confidences)/len(current_confidences),
                        "timestamp": last_time
                    })
                    current_signs = []
                    current_confidences = []
                last_time = t
                continue

            # Check if temporal pause occurred before this sign
            if current_signs and (t - last_time > pause_threshold):
                english = self.translate_sequence(current_signs, sum(current_confidences)/len(current_confidences))
                sentences.append({
                    "signs": list(current_signs),
                    "english": english,
                    "confidence": sum(current_confidences)/len(current_confidences),
                    "timestamp": last_time
                })
                current_signs = []
                current_confidences = []

            current_signs.append(sign)
            current_confidences.append(conf)
            last_time = t

        if current_signs:
            english = self.translate_sequence(current_signs, sum(current_confidences)/len(current_confidences))
            sentences.append({
                "signs": list(current_signs),
                "english": english,
                "confidence": sum(current_confidences)/len(current_confidences),
                "timestamp": last_time
            })

        return sentences

translator = ISLLanguageTranslator()
