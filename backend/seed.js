const Blog = require('./models/Blog');
const connectDB = require('./config/db');
require('dotenv').config();

/**
 * Default blog posts for seeding the database
 */
const defaultBlogs = [
  {
    title: "Understanding English Tenses: A Complete Guide",
    content: `# Understanding English Tenses

English has 12 main tenses, divided into three time periods: past, present, and future. Each time period has four aspects: simple, continuous, perfect, and perfect continuous.

## Present Tenses

### Simple Present
Used for habits, facts, and scheduled events.
- **Example:** I work every day. The sun rises in the east.

### Present Continuous
Used for actions happening now or temporary situations.
- **Example:** I am working on a project. She is staying with us this week.

### Present Perfect
Used for past actions with present relevance or experiences.
- **Example:** I have finished my homework. Have you ever been to Paris?

### Present Perfect Continuous
Used for actions that started in the past and continue to now.
- **Example:** I have been working here for five years.

## Past Tenses

### Simple Past
Used for completed actions in the past.
- **Example:** I worked yesterday. She visited London last summer.

### Past Continuous
Used for ongoing actions in the past.
- **Example:** I was working when he called.

### Past Perfect
Used for actions completed before another past action.
- **Example:** I had finished before she arrived.

### Past Perfect Continuous
Used for ongoing actions before another past action.
- **Example:** I had been working for hours when he called.

## Practice Tips
1. Read English texts and identify tenses
2. Write daily journal entries using different tenses
3. Practice converting sentences between tenses`,
    category: "grammar",
    difficulty: "beginner",
    tags: ["tenses", "grammar basics", "verb forms"]
  },
  {
    title: "Mastering Articles: A, An, and The",
    content: `# Mastering English Articles

Articles are small words with big importance in English. Let's understand when to use 'a', 'an', and 'the'.

## Indefinite Articles: A and An

### When to use 'A'
Use 'a' before words that start with a consonant sound:
- a book, a car, a university (note: 'u' sounds like 'yoo')

### When to use 'An'
Use 'an' before words that start with a vowel sound:
- an apple, an hour (note: 'h' is silent), an umbrella

## Definite Article: The

Use 'the' when:
1. **Specific item:** The book on the table
2. **Already mentioned:** I saw a dog. The dog was brown.
3. **Unique items:** The sun, the moon, the President
4. **Superlatives:** The best, the tallest
5. **Musical instruments:** Play the piano

## When NOT to use articles
- General plurals: Dogs are loyal. (not 'The dogs are loyal' when speaking generally)
- Abstract nouns: Love is beautiful.
- Meals: Let's have breakfast.
- Languages: I speak English.

## Common Mistakes to Avoid
❌ I need a advice → ✅ I need advice (uncountable)
❌ The life is beautiful → ✅ Life is beautiful (general)
❌ I play piano → ✅ I play the piano (musical instruments)`,
    category: "grammar",
    difficulty: "beginner",
    tags: ["articles", "grammar basics", "a an the"]
  },
  {
    title: "Common English Idioms and Their Meanings",
    content: `# Popular English Idioms

Idioms are phrases where the meaning isn't obvious from the individual words. Learning them will make your English sound more natural!

## Weather Idioms
- **"It's raining cats and dogs"** - It's raining very heavily
- **"Under the weather"** - Feeling sick or unwell
- **"A storm in a teacup"** - A big fuss about something unimportant

## Animal Idioms
- **"Let the cat out of the bag"** - Reveal a secret accidentally
- **"Kill two birds with one stone"** - Accomplish two things with one action
- **"The elephant in the room"** - An obvious problem nobody wants to discuss

## Body Part Idioms
- **"Cost an arm and a leg"** - Very expensive
- **"Break a leg"** - Good luck (used in theater)
- **"Keep your chin up"** - Stay positive despite difficulties

## Food Idioms
- **"Piece of cake"** - Something very easy
- **"Spill the beans"** - Reveal secret information
- **"In a nutshell"** - In summary, briefly

## Color Idioms
- **"Feel blue"** - Feel sad
- **"Green with envy"** - Very jealous
- **"In the red"** - In debt

## How to Learn Idioms
1. Learn them in context
2. Practice using them in sentences
3. Watch movies and TV shows
4. Keep an idiom journal`,
    category: "vocabulary",
    difficulty: "intermediate",
    tags: ["idioms", "expressions", "vocabulary"]
  },
  {
    title: "Improve Your English Pronunciation",
    content: `# Tips for Better English Pronunciation

Clear pronunciation is key to being understood. Here are strategies to improve!

## Common Pronunciation Challenges

### The 'TH' Sound
Many languages don't have this sound:
- **Voiced TH** (the, this, that) - tongue between teeth, vibrate
- **Voiceless TH** (think, thing, thank) - tongue between teeth, no vibration

### Silent Letters
English has many silent letters:
- **K in 'know', 'knee', 'knight'**
- **W in 'write', 'wrong', 'wrist'**
- **B in 'climb', 'comb', 'thumb'**
- **GH in 'night', 'thought', 'daughter'**

### Word Stress
English is a stress-timed language:
- **PHOtograph** vs **phoTOgraphy** vs **photoGRAphic**
- Stress changes meaning: **REcord** (noun) vs **reCORD** (verb)

## Practice Techniques

### 1. Shadow Speaking
Listen to native speakers and repeat immediately after them, copying their intonation.

### 2. Record Yourself
Compare your pronunciation to native speakers.

### 3. Minimal Pairs Practice
Practice words that differ by one sound:
- ship/sheep
- bit/beat
- cat/cut

### 4. Tongue Twisters
- "She sells seashells by the seashore"
- "Peter Piper picked a peck of pickled peppers"

## Resources
- YouTube pronunciation channels
- Podcasts for English learners
- Language exchange partners`,
    category: "speaking",
    difficulty: "intermediate",
    tags: ["pronunciation", "speaking", "accent"]
  },
  {
    title: "Writing Better English Emails",
    content: `# Professional Email Writing Guide

Email is crucial for professional communication. Learn to write clear, effective emails!

## Email Structure

### 1. Subject Line
Be specific and concise:
- ❌ "Meeting" 
- ✅ "Marketing Meeting - March 15th at 2 PM"

### 2. Greeting
**Formal:**
- Dear Mr./Ms. [Last Name],
- Dear Hiring Manager,

**Semi-formal:**
- Hello [First Name],
- Good morning/afternoon,

**Informal:**
- Hi [Name],
- Hey [Name], (only for close colleagues)

### 3. Opening Line
- I hope this email finds you well.
- Thank you for your quick response.
- Following up on our conversation...

### 4. Body
- Keep paragraphs short (2-3 sentences)
- Use bullet points for lists
- One main topic per email

### 5. Closing
**Formal:**
- Sincerely,
- Best regards,
- Kind regards,

**Semi-formal:**
- Best,
- Thanks,
- Cheers, (British)

## Useful Phrases

**Requesting:**
- Could you please...
- I would appreciate if you could...
- Would it be possible to...

**Apologizing:**
- I apologize for any inconvenience.
- Sorry for the delayed response.

**Confirming:**
- I'm writing to confirm...
- This is to confirm that...

## Common Mistakes
1. Using ALL CAPS (looks like shouting)
2. Too many exclamation marks!!!
3. Forgetting attachments (mention them)
4. Reply All when not necessary`,
    category: "writing",
    difficulty: "intermediate",
    tags: ["email", "writing", "business English"]
  },
  {
    title: "Advanced Vocabulary Building Strategies",
    content: `# Building Advanced English Vocabulary

Expand your vocabulary systematically to sound more fluent and articulate.

## Word Formation

### Prefixes
- **un-** (not): unhappy, unlikely, unfair
- **re-** (again): rewrite, redo, rethink
- **pre-** (before): preview, prehistoric, preorder
- **dis-** (opposite): disagree, disappear, dislike
- **mis-** (wrongly): misunderstand, misplace, mislead

### Suffixes
- **-tion/-sion** (noun): education, decision
- **-ment** (noun): development, achievement
- **-ful** (adjective): beautiful, helpful
- **-less** (without): helpless, careless
- **-ly** (adverb): quickly, carefully

## Word Families
Learn related words together:
- **Create** (verb) → Creation (noun) → Creative (adj) → Creatively (adv)
- **Success** (noun) → Succeed (verb) → Successful (adj) → Successfully (adv)

## Collocations
Words that naturally go together:
- Make a decision (not "do a decision")
- Heavy rain (not "strong rain")
- Catch a cold (not "get a cold")
- Pay attention (not "give attention")

## Academic Vocabulary

### Describing Increase/Decrease
- Surge, soar, skyrocket (big increase)
- Plummet, plunge, crash (big decrease)
- Fluctuate, vary (change unpredictably)

### Cause and Effect
- Lead to, result in, give rise to
- Stem from, arise from, be attributed to

## Learning Techniques
1. **Spaced Repetition:** Review words at increasing intervals
2. **Context Learning:** Learn words in sentences
3. **Word Maps:** Create visual connections
4. **Use Immediately:** Use new words in conversation
5. **Read Widely:** Expose yourself to varied vocabulary`,
    category: "vocabulary",
    difficulty: "advanced",
    tags: ["vocabulary", "word formation", "advanced English"]
  },
  {
    title: "Understanding Reported Speech",
    content: `# Mastering Reported (Indirect) Speech

Reported speech is used to tell someone what another person said without using their exact words.

## Basic Rules

### Tense Changes (Backshift)
When the reporting verb is past tense, other tenses shift back:

| Direct Speech | Reported Speech |
|--------------|-----------------|
| Present Simple → | Past Simple |
| Present Continuous → | Past Continuous |
| Past Simple → | Past Perfect |
| Present Perfect → | Past Perfect |
| Will → | Would |
| Can → | Could |

### Examples
- Direct: "I am happy" → Reported: She said (that) she was happy.
- Direct: "I will come" → Reported: He said he would come.
- Direct: "I have finished" → Reported: She said she had finished.

## Pronoun Changes
Pronouns change based on who is speaking:
- I → he/she
- We → they
- My → his/her
- You → I/me/we (depends on context)

## Time and Place Changes
- Today → that day
- Tomorrow → the next day
- Yesterday → the day before
- Here → there
- This → that

## Reporting Questions

### Yes/No Questions
Use 'if' or 'whether':
- Direct: "Are you coming?" 
- Reported: She asked if/whether I was coming.

### Wh- Questions
Keep the question word but use statement word order:
- Direct: "Where do you live?"
- Reported: He asked where I lived.

## Reporting Commands
Use 'told' + infinitive:
- Direct: "Close the door!"
- Reported: She told me to close the door.

## Practice Exercises
1. Convert direct speech to reported speech daily
2. Watch news and practice reporting what was said
3. Keep a journal converting conversations to reported speech`,
    category: "grammar",
    difficulty: "advanced",
    tags: ["reported speech", "indirect speech", "grammar"]
  },
  {
    title: "English Conversation Starters and Small Talk",
    content: `# Mastering Small Talk in English

Small talk is essential for building relationships and making connections. Here's how to do it naturally!

## Starting Conversations

### With Strangers
- "Hi, is this seat taken?"
- "The weather's beautiful today, isn't it?"
- "This is a great event. How do you know the host?"

### At Work
- "How's your day going?"
- "Did you have a good weekend?"
- "Have you tried the new coffee place nearby?"

### At Social Events
- "How do you know [host name]?"
- "What brings you here today?"
- "I love your [accessory]. Where did you get it?"

## Safe Topics for Small Talk
✅ Weather
✅ Current events (non-controversial)
✅ Sports
✅ Movies/TV shows
✅ Travel
✅ Food/restaurants
✅ Hobbies

## Topics to Avoid
❌ Religion
❌ Politics
❌ Personal finances
❌ Controversial issues
❌ Gossip about others
❌ Health problems

## Keeping Conversation Going

### Follow-up Questions
- "That's interesting! Tell me more."
- "How long have you been doing that?"
- "What got you interested in that?"

### Showing Interest
- "Really? I didn't know that!"
- "That sounds amazing!"
- "I've always wanted to try that."

### Sharing Similar Experiences
- "I've had a similar experience..."
- "That reminds me of when I..."

## Ending Conversations Politely
- "It was great talking to you!"
- "I should let you mingle. Nice meeting you!"
- "I need to grab a drink, but let's chat more later."
- "Let me give you my contact. We should continue this conversation!"

## Practice Tips
1. Start conversations with cashiers, neighbors
2. Practice with language exchange partners
3. Join clubs or groups with shared interests`,
    category: "speaking",
    difficulty: "beginner",
    tags: ["conversation", "small talk", "speaking skills"]
  }
];

/**
 * Seed the database with default blog posts
 */
const seedBlogs = async () => {
  try {
    await connectDB();
    
    const Blog = require('./models/Blog');
    const User = require('./models/User');
    
    // Check if blogs already exist
    const existingBlogs = await Blog.countDocuments();
    if (existingBlogs > 0) {
      console.log(`Database already has ${existingBlogs} blogs. Skipping seed.`);
      process.exit(0);
    }
    
    // Create an admin user if not exists
    let adminUser = await User.findOne({ email: 'admin@echo.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'ECHO Admin',
        email: 'admin@echo.com',
        password: 'admin123',
        isAdmin: true
      });
      console.log('Created admin user: admin@echo.com / admin123');
    }
    
    // Add author to all blogs
    const blogsWithAuthor = defaultBlogs.map(blog => ({
      ...blog,
      author: adminUser._id
    }));
    
    // Insert blogs
    await Blog.insertMany(blogsWithAuthor);
    console.log(`Successfully seeded ${defaultBlogs.length} blog posts!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedBlogs();
