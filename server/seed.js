/**
 * CINETTER — Comprehensive Seed Script
 * Seeds 20 records across: Users, Votes, Reviews, Collections, Spaces posts, Watchlists
 * Run: node seed.js  (from server/ directory, with MONGODB_URI in .env)
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config(); // seed.js is in server/ — .env is in the same directory

// ── Inline schemas (so seed is self-contained) ──────────────────────────
const userSchema = new mongoose.Schema({
  username: String, email: String, password: String,
  role: { type: String, default: 'user' }, bio: String,
  avatar: String, isBanned: { type: Boolean, default: false },
  followers: [mongoose.Schema.Types.ObjectId], following: [mongoose.Schema.Types.ObjectId],
  refreshToken: String, lastLogin: Date,
}, { timestamps: true });

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movieId: Number,
  category: { type: String, enum: ['drop', 'chill', 'engage', 'masterpiece'] },
}, { timestamps: true });
voteSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movieId: Number, mediaType: { type: String, default: 'movie' },
  title: String, content: String, rating: Number,
  spoiler: { type: Boolean, default: false },
  likes: [mongoose.Schema.Types.ObjectId],
  isRemoved: { type: Boolean, default: false },
  cinePulseCategory: String,
}, { timestamps: true });

const collectionSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String, description: String, isPublic: { type: Boolean, default: true },
  movies: [Number], likeCount: { type: Number, default: 0 },
}, { timestamps: true });

const spacePostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['news', 'discussion', 'poll'], default: 'discussion' },
  title: String, content: String, topics: [String],
  likeCount: { type: Number, default: 0 }, comments: { type: Number, default: 0 },
}, { timestamps: true });

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movieId: Number, title: String, poster_path: String,
  media_type: { type: String, default: 'movie' }, release_date: String,
}, { timestamps: true });
watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// ── Models ─────────────────────────────────────────────────────────────
const User       = mongoose.model('User', userSchema);
const Vote       = mongoose.model('Vote', voteSchema);
const Review     = mongoose.model('Review', reviewSchema);
const Collection = mongoose.model('Collection', collectionSchema);
const SpacePost  = mongoose.model('SpacePost', spacePostSchema);
const Watchlist  = mongoose.model('Watchlist', watchlistSchema);

// ── Seed Data ──────────────────────────────────────────────────────────
const USERS_DATA = [
  { username: 'cinephile_raj',    email: 'raj@cinetter.dev',       password: 'Test@1234',  bio: 'Bollywood + World Cinema lover. Anurag Kashyap is God.', role: 'user' },
  { username: 'filmcritic_aa',   email: 'aanya@cinetter.dev',     password: 'Test@1234',  bio: 'Film school dropout turned full-time movie obsessive.', role: 'user' },
  { username: 'anime_otaku99',   email: 'otaku@cinetter.dev',     password: 'Test@1234',  bio: 'Spirited Away changed my life. Attack on Titan is peak.', role: 'user' },
  { username: 'tollywood_fan',   email: 'twood@cinetter.dev',     password: 'Test@1234',  bio: 'RRR on loop forever. Baahubali era never ended.', role: 'user' },
  { username: 'cinetter_mod',    email: 'mod@cinetter.dev',       password: 'Mod@1234',   bio: 'Content moderator. Keeping the community civil.', role: 'moderator' },
  { username: 'cinetter_admin',  email: 'admin@cinetter.dev',     password: 'Admin@1234', bio: 'Platform administrator.', role: 'admin' },
];

// Real TMDB movie IDs — varied genres/regions
const MOVIES = [
  { id: 872585, title: 'Oppenheimer', poster: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', year: '2023-07-21' },
  { id: 238, title: 'The Godfather', poster: '/3bhkrj58Vtu7enYsLLeUsVQ2x9e.jpg', year: '1972-03-24' },
  { id: 129, title: 'Spirited Away', poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', year: '2001-07-20' },
  { id: 496243, title: 'Parasite', poster: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', year: '2019-05-30' },
  { id: 693134, title: 'Dune: Part Two', poster: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', year: '2024-03-01' },
  { id: 346698, title: 'Barbie', poster: '/iuFNMS8vlbY4MRuB9mBNUFKfGjO.jpg', year: '2023-07-21' },
  { id: 19404, title: 'Dilwale Dulhania Le Jayenge', poster: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg', year: '1995-10-20' },
  { id: 792307, title: 'Poor Things', poster: '/kCGlIMHnOm8JPXSmVd1BAZuNdWU.jpg', year: '2023-09-01' },
  { id: 361743, title: 'Top Gun: Maverick', poster: '/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', year: '2022-05-27' },
  { id: 22492, title: 'RRR', poster: '/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg', year: '2022-03-25' },
  { id: 936075, title: 'Michael', poster: '/A7EByudX0eOzlsZ2DYAJc11iR2e.jpg', year: '2025-04-18' },
];

// 20 Vote records — varied users, movies, and ALL 4 categories
const VOTES_DATA = [
  { user: 0, movie: 0, cat: 'masterpiece' },   // Oppenheimer → masterpiece
  { user: 1, movie: 0, cat: 'masterpiece' },   // Oppenheimer → masterpiece (critic agrees)
  { user: 2, movie: 0, cat: 'engage' },         // Oppenheimer → engage (otaku less blown)
  { user: 0, movie: 1, cat: 'masterpiece' },   // Godfather → masterpiece
  { user: 1, movie: 1, cat: 'masterpiece' },
  { user: 3, movie: 1, cat: 'chill' },          // Godfather → chill (tollywood fan finds it slow)
  { user: 2, movie: 2, cat: 'masterpiece' },   // Spirited Away → masterpiece (otaku)
  { user: 0, movie: 2, cat: 'masterpiece' },
  { user: 1, movie: 2, cat: 'engage' },
  { user: 3, movie: 3, cat: 'masterpiece' },   // Parasite → masterpiece
  { user: 0, movie: 3, cat: 'masterpiece' },
  { user: 2, movie: 3, cat: 'engage' },
  { user: 1, movie: 4, cat: 'engage' },         // Dune 2 → engage
  { user: 2, movie: 4, cat: 'masterpiece' },
  { user: 3, movie: 5, cat: 'chill' },          // Barbie → chill
  { user: 0, movie: 5, cat: 'drop' },           // Barbie → drop (cinephile)
  { user: 1, movie: 5, cat: 'engage' },
  { user: 3, movie: 6, cat: 'masterpiece' },   // DDLJ → masterpiece (tollywood fan)
  { user: 3, movie: 9, cat: 'masterpiece' },   // RRR → masterpiece (tollywood fan)
  { user: 0, movie: 9, cat: 'engage' },         // RRR → engage
  { user: 0, movie: 10, cat: 'engage' },        // Michael → engage
  { user: 1, movie: 10, cat: 'masterpiece' },   // Michael → masterpiece
  { user: 2, movie: 10, cat: 'chill' },         // Michael → chill
  { user: 3, movie: 10, cat: 'masterpiece' },   // Michael → masterpiece
];

const REVIEWS_DATA = [
  { user: 0, movie: 0, title: 'A cinematic atom bomb — flawless in every frame', content: 'Nolan has made something truly generational. The IMAX sequences are unlike anything I have ever witnessed. The sound design alone deserves every award. Cillian Murphy carries impossible weight with absolute precision. The editing during the Trinity test is cinema at its absolute peak.', rating: 10, spoiler: false },
  { user: 1, movie: 0, title: 'Technically magnificent but emotionally distant', content: 'I admire the craft immensely but felt slightly disconnected from Oppenheimer as a human being. The non-linear structure is dazzling but occasionally confusing. Still, Downey Jr\'s courtroom scenes are some of the best acting I\'ve seen this decade.', rating: 8, spoiler: false },
  { user: 2, movie: 2, title: 'Spirited Away is not just a film, it is a feeling', content: 'Every single frame is a painting. The bathhouse sequences, the train ride over water, the farewell — Miyazaki created something beyond cinema. I have watched this 14 times and I still find new details. No other animated film comes close.', rating: 10, spoiler: false },
  { user: 3, movie: 9, title: 'RRR is what Indian cinema was born to make', content: 'SS Rajamouli did the impossible. He made an action film with heart, scale, emotion, and spectacular choreography. Naatu Naatu is permanently in my brain. The Interval block alone is worth the ticket price. A film for the ages.', rating: 10, spoiler: false },
  { user: 1, movie: 3, title: 'Parasite is a masterclass in subversive storytelling', content: 'Bong Joon-ho orchestrates every scene with surgical precision. The basement reveal completely recontextualizes everything you\'ve seen. The social commentary cuts deep without ever feeling preachy. This film deserved every Oscar it won.', rating: 10, spoiler: true },
  { user: 1, movie: 10, title: 'A fitting tribute to the King of Pop', content: 'Antoine Fuqua masterfully captures the essence of Michael Jackson. The attention to detail in the concert recreations is astounding, and Jaafar Jackson embodies his uncle perfectly. A must-watch for fans.', rating: 9, spoiler: false, cinePulseCategory: 'masterpiece' },
  { user: 2, movie: 10, title: 'Visually stunning, slightly uneven', content: 'The music obviously carries the film, and the choreography is peak. However, the pacing dips in the second act. Still a very enjoyable watch, especially in theaters with good sound.', rating: 7, spoiler: false, cinePulseCategory: 'chill' },
  { user: 3, movie: 10, title: 'Electrifying performances!', content: 'I was blown away by the moonwalk sequence. The film does a great job of showing his creative process and the pressure of fame. Definitely going to watch this again.', rating: 8, spoiler: true, cinePulseCategory: 'masterpiece' },
];

const COLLECTIONS_DATA = [
  { user: 0, name: 'My Masterpiece Shelf', desc: 'Films I would show aliens to explain what cinema is.', public: true, movies: [238, 129, 496243, 872585] },
  { user: 1, name: 'Critic\'s Essential 100', desc: 'Curated from Sight & Sound, Cahiers, and my own obsessions.', public: true, movies: [238, 496243, 792307, 129] },
  { user: 2, name: 'Peak Anime Watches', desc: 'Studio Ghibli + the modern masterpieces. Ranked.', public: true, movies: [129] },
  { user: 3, name: 'Indian Cinema at its Best', desc: 'The films that prove Bollywood and Tollywood can compete globally.', public: true, movies: [19404, 22492] },
  { user: 0, name: 'Private List — To Watch', desc: 'My personal backlog.', public: false, movies: [693134, 346698, 361743] },
];

const SPACES_DATA = [
  { user: 0, type: 'discussion', title: 'Is Oppenheimer the greatest film of the 2020s so far?', content: 'Christopher Nolan has never made a film this devastating. The IMAX scenes alone justify any claim to greatness. But is it better than Parasite? Better than The Power of the Dog? Let\'s debate.', topics: ['International'] },
  { user: 1, type: 'news', title: 'Cannes 2025 Palme d\'Or predictions — who gets it this year?', content: 'The Cannes lineup is stacked. Wes Anderson is back, Coppola has a new film, and rumours swirl about an Indian entry. Who do you think takes the top prize this year?', topics: ['International'] },
  { user: 2, type: 'discussion', title: 'Studio Ghibli vs modern anime — is Ghibli overrated?', content: 'Hot take: Demon Slayer and Jujutsu Kaisen have technically surpassed early Ghibli in animation quality. But Ghibli\'s storytelling soul is irreplaceable. Thoughts?', topics: ['Anime'] },
  { user: 3, type: 'news', title: 'Pushpa 2 becomes the highest-grossing Indian film of all time', content: 'Allu Arjun\'s Pushpa 2 has officially crossed ₹1,800 crore globally. The blockbuster juggernaut shows no signs of slowing down. Where does this rank in Indian cinema history?', topics: ['Indian'] },
  { user: 1, type: 'poll', title: 'Which CinePulse vote best describes Barbie (2023)?', content: 'Greta Gerwig\'s Barbie divided audiences globally. Critics loved it, some viewers found it preachy. What is your honest CinePulse vote? Vote below and explain your reasoning.', topics: ['International'] },
];

const WATCHLISTS_DATA = [
  { user: 0, movie: 4 }, { user: 0, movie: 7 }, { user: 0, movie: 8 },
  { user: 1, movie: 0 }, { user: 1, movie: 4 }, { user: 1, movie: 5 },
  { user: 2, movie: 3 }, { user: 2, movie: 4 }, { user: 2, movie: 9 },
  { user: 3, movie: 6 }, { user: 3, movie: 8 },
];

// ── Main seeder ────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌  MONGODB_URI not set in .env'); process.exit(1); }

  console.log('🔗  Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅  Connected\n');

  // Clear existing seed data
  console.log('🧹  Clearing previous seed data...');
  await Promise.all([
    User.deleteMany({ email: { $regex: '@cinetter.dev$' } }),
    Vote.deleteMany({}),
    Review.deleteMany({}),
    Collection.deleteMany({}),
    SpacePost.deleteMany({}),
    Watchlist.deleteMany({}),
  ]);

  // Create users
  console.log('👥  Creating 5 users...');
  const hashedUsers = await Promise.all(
    USERS_DATA.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
      lastLogin: new Date(),
    }))
  );
  const users = await User.insertMany(hashedUsers);
  console.log(`   ✅  Users: ${users.map(u => u.username).join(', ')}`);

  // Set up followers (raj follows aanya, otaku, tollywood)
  users[0].following = [users[1]._id, users[2]._id, users[3]._id];
  users[1].followers = [users[0]._id];
  users[1].following = [users[0]._id];
  users[0].followers = [users[1]._id];
  await Promise.all([users[0].save(), users[1].save()]);

  // Create votes (20 records)
  console.log('🗳️   Creating 20 votes across 4 categories...');
  const voteOps = VOTES_DATA.map(v => ({
    updateOne: {
      filter: { userId: users[v.user]._id, movieId: MOVIES[v.movie].id },
      update: { $set: { userId: users[v.user]._id, movieId: MOVIES[v.movie].id, category: v.cat } },
      upsert: true,
    },
  }));
  await Vote.bulkWrite(voteOps);
  console.log('   ✅  20 votes seeded');

  // Create reviews (5 records)
  console.log('📝  Creating 5 reviews...');
  const reviewDocs = REVIEWS_DATA.map(r => ({
    userId: users[r.user]._id,
    movieId: MOVIES[r.movie].id,
    mediaType: 'movie',
    title: r.title,
    content: r.content,
    rating: r.rating,
    spoiler: r.spoiler,
    cinePulseCategory: r.cinePulseCategory,
    isRemoved: false,
    likes: r.rating === 10 ? [users[0]._id, users[1]._id] : [],
  }));
  await Review.insertMany(reviewDocs);
  console.log('   ✅  5 reviews seeded');

  // Create collections (5 records)
  console.log('📚  Creating 5 collections...');
  const colDocs = COLLECTIONS_DATA.map(c => ({
    authorId: users[c.user]._id,
    name: c.name,
    description: c.desc,
    isPublic: c.public,
    movies: c.movies,
    likeCount: Math.floor(Math.random() * 80),
  }));
  await Collection.insertMany(colDocs);
  console.log('   ✅  5 collections seeded');

  // Create space posts (5 records)
  console.log('💬  Creating 5 Space posts...');
  const postDocs = SPACES_DATA.map((s, i) => ({
    authorId: users[s.user]._id,
    type: s.type,
    title: s.title,
    content: s.content,
    topics: s.topics,
    likeCount: [142, 387, 215, 456, 298][i],
    comments: [23, 56, 89, 78, 41][i],
  }));
  await SpacePost.insertMany(postDocs);
  console.log('   ✅  5 Spaces posts seeded');

  // Create watchlists (11 records)
  console.log('🎬  Creating watchlist entries...');
  const wlOps = WATCHLISTS_DATA.map(w => ({
    updateOne: {
      filter: { userId: users[w.user]._id, movieId: MOVIES[w.movie].id },
      update: {
        $set: {
          userId: users[w.user]._id,
          movieId: MOVIES[w.movie].id,
          title: MOVIES[w.movie].title,
          poster_path: MOVIES[w.movie].poster,
          media_type: 'movie',
          release_date: MOVIES[w.movie].year,
        },
      },
      upsert: true,
    },
  }));
  await Watchlist.bulkWrite(wlOps);
  console.log('   ✅  11 watchlist entries seeded');

  console.log('\n════════════════════════════════════════');
  console.log('✅  SEED COMPLETE — 6 users + 20 votes + 5 reviews + 5 collections + 5 posts + 11 watchlist');
  console.log('════════════════════════════════════════');
  console.log('\n📋  Test Accounts:');
  console.log('   User:      raj@cinetter.dev       / Test@1234');
  console.log('   User:      aanya@cinetter.dev     / Test@1234');
  console.log('   User:      otaku@cinetter.dev     / Test@1234');
  console.log('   User:      twood@cinetter.dev     / Test@1234');
  console.log('   Moderator: mod@cinetter.dev       / Mod@1234');
  console.log('   Admin:     admin@cinetter.dev     / Admin@1234');
  console.log('\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
