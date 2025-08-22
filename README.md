# Romantic Interest Score (RIS) — Mathematical Documentation

This document outlines the **mathematical formulas**, **logical flow**, and **technical implementation** of the Romantic Interest Score (RIS) algorithm. It also highlights core **limitations** of the model and explains why it should be used only for educational purposes.

---

## 1. Overall Formula: Weighted Sum

The final RIS is computed as a **weighted sum** of six normalized metrics:

Where:

| Symbol | Metric                   |
|-------|---------------------------|
| S     | Sentiment score           |
| K     | Romantic keyword score    |
| I     | Initiation ratio          |
| Q     | Question score            |
| V     | Response velocity         |
| E     | Effort balance            |

All **weights** sum to 1:

## 2. Individual Metric Calculations

| Metric | Formula |
|--------|---------|
| **a. Sentiment Score (S)** | S = ( (Σ sentiment(w) / W) + 2 ) / 4 |
| **b. Romantic Keyword Score (K)** | K = min(1.0, (5 × K_count) / M_their) |
| **c. Initiation Ratio (I)** | I = Initiations_them / (Initiations_you + Initiations_them) |
| **d. Question Score (Q)** | Q = min(1.0, (3 × Q_count) / M_their) |
| **e. Response Velocity (V)** | V = max(0, 1 − (AvgReplyMinutes / 180)) |
| **f. Effort Balance (E)** | E = 1 − |1 − (L_them / L_you)| |


##  3. Weaknesses & Limitations

Despite being an interesting and fun conceptual approach, the RIS algorithm has **significant limitations**:

- **No Contextual Understanding** — treats all text literally (inside jokes, meaningful conversations, etc.).
- **Cannot Detect Sarcasm/Irony** — sentiment analysis may interpret negative sarcasm as positive.
- **Cultural & Linguistic Bias** — keyword lists are Western/English focused.
- **Oversimplification of Human Behavior** — numeric features do not capture real-life nuance.
- **Static Weights** — relative importance of metrics varies across relationships.
- **Ignores Non-Textual Communication** — GIFs, memes, reactions, etc. are excluded from analysis.

---

##  4. Technical Implementation

| Area | Description |
|------|------------|
| **Platform** | Runs entirely in the **browser**. No data leaves the client device. |
| **Stack** | **HTML**, **Tailwind CSS**, **JavaScript** |
| **File Handling** | `FileReader` API for `.txt` files; `JSZip` for `.zip` archives |
| **Parsing** | Regex for parsing WhatsApp chat exports (date, time, sender, message) |
| **Calculation Engine** | Individual JS functions: `calculateSentiment`, `calculateKeywords`, etc., aggregated in `calculateRis` |
| **DOM Manipulation** | Results are rendered dynamically (animated gauge + progress bars) |

---

##  5. Conclusion

The Romantic Interest Score Calculator is an **educational project** that demonstrates how **qualitative** text data can be converted into **quantitative** metrics.

>  It is **not** a reliable tool for making decisions about personal relationships.

Use it to **learn**, **experiment with the logic**, and **modify the weights**, but always remember:  
**Real communication is more important than any numerical score.**

---

### Suggested Next Steps

- Tweak the weights to see how the RIS changes.
- Expand the keyword lists to support different cultures or languages.
- Add detection for emojis, images, or reaction-based messages.

---

**Enjoy exploring how algorithms interpret human interactions — responsibly and thoughtfully!**
