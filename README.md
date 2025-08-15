Mathematical Documentation for the RIS Algorithm
This document outlines the mathematical and logical formulas used to calculate the Romantic Interest Score (RIS), details the inherent weaknesses of the model, and provides a brief overview of its technical implementation.

1. Overall Formula: The Weighted Sum
The final RIS is calculated as a weighted sum of six individual metrics. Each metric is first normalized to a score between 0 and 1.

The governing formula is:

RIS=(w 
S
​
 ⋅S)+(w 
K
​
 ⋅K)+(w 
I
​
 ⋅I)+(w 
Q
​
 ⋅Q)+(w 
V
​
 ⋅V)+(w 
E
​
 ⋅E)
Where:

S,K,I,Q,V,E are the normalized scores for Sentiment, Keywords, Initiation, Questions, Velocity, and Effort, respectively.

w 
S
​
 ,w 
K
​
 ,w 
I
​
 ,w 
Q
​
 ,w 
V
​
 ,w 
E
​
  are the corresponding weights for each metric, with the condition that ∑w=1.

In the code, the weights are defined as:

w 
S
​
 =0.15

w 
K
​
 =0.25

w 
I
​
 =0.15

w 
Q
​
 =0.20

w 
V
​
 =0.10

w 
E
​
 =0.15

2. Individual Metric Calculations
(The detailed breakdown of the six metric calculations remains the same as the previous version.)

a. Sentiment Score (S)
S= 
4
S 
avg
​
 +2
​
 
b. Romantic Keyword Score (K)
K=min(1.0, 
∣M 
their
​
 ∣
C 
K
​
 
​
 ⋅5)
c. Initiation Ratio (I)
I= 
Total conversations initiated
Conversations initiated by them
​
 
d. Question Score (Q)
Q=min(1.0, 
∣M 
their
​
 ∣
C 
Q
​
 
​
 ⋅3)
e. Response Velocity (V)
V=max(0,1− 
180
t 
avg
​
 
​
 )
f. Effort Balance (E)
E=1− 
​
 1− 
L 
you
​
 
L 
them
​
 
​
  
​
 
3. Weaknesses and Limitations of the Algorithm
While serving as an interesting conceptual model, the RIS algorithm is fundamentally flawed as a tool for accurately measuring human emotion. Its weaknesses are significant and must be understood.

Lack of Contextual Understanding: The algorithm cannot comprehend the context of a conversation. An inside joke, a shared memory, or a serious discussion will be processed with the same literal interpretation as any other message.

Inability to Detect Nuance (Sarcasm, Irony): The model is incapable of detecting sarcasm or irony. A statement like "I just love when you ignore me" would be scored positively by the sentiment analysis, leading to a fundamentally incorrect interpretation.

Cultural and Linguistic Bias: The SENTIMENT_WORDS and ROMANTIC_KEYWORDS dictionaries are hardcoded and based on a specific (primarily Western, English-speaking) cultural context. Slang, different languages, or different cultural methods of expressing affection will not be registered, rendering the analysis ineffective.

Oversimplification of Human Behavior: The algorithm reduces complex human interactions to simple, quantifiable metrics. A slow response time might be interpreted as disinterest, when it could be due to a busy work schedule, personal issues, or simply a different communication style.

Static and Inflexible Weights: The weights assigned to each metric are arbitrary and static. For some relationships, "Effort Balance" might be the most crucial indicator, while for others, "Keywords" might be more telling. The model cannot adapt to the unique dynamics of each relationship.

Ignoring Non-Textual Communication: A significant portion of modern communication (memes, GIFs, images, reactions) is ignored by the parser, which only processes text. These non-textual elements often carry substantial emotional weight.

4. Technical Implementation Aspects
The web application is built using a standard front-end stack and runs entirely in the client's browser. No data is sent to a server.

Core Technologies: The application is built with HTML for structure, CSS (with Tailwind CSS for styling) for presentation, and JavaScript for all logic and interactivity.

File Handling:

The browser's FileReader API is used to read the content of user-uploaded .txt files.

For .zip files, the JSZip third-party library is used to decompress the archive in the browser and extract the first .txt file it finds.

Parsing Logic:

A Regular Expression (Regex) is the core of the parser. It is specifically designed to match the date, time, sender, and message content format of WhatsApp chat exports.

The parser iterates through each line of the file, attempts to match the regex, and constructs a structured array of message objects, each containing the sender, text, and a JavaScript Date object for the timestamp.

Calculation Engine: All mathematical formulas are implemented as distinct JavaScript functions (calculateSentiment, calculateKeywords, etc.). This modular approach keeps the code organized and easy to debug. The final score is aggregated in the calculateRis function.

DOM Manipulation: After the calculation is complete, JavaScript is used to dynamically update the HTML Document Object Model (DOM) to hide the input form and display the results, including the animated gauge and progress bars.

5. Conclusion
The Romantic Interest Score (RIS) Calculator is an educational project designed to demonstrate how text data can be parsed and analyzed using simple algorithms. It serves as a practical example of applying quantitative metrics to qualitative data.

However, it is crucial to reiterate that this tool is for entertainment and educational purposes only. The inherent limitations of the algorithm mean it cannot and should not be used to make real-life decisions regarding personal relationships. Human connection is profoundly complex and cannot be accurately represented by a single numerical score.

Users are encouraged to explore the code, modify the weights, and experiment with the logic as a way to learn about data processing, but to always rely on genuine, direct communication for understanding human emotions.
