/**
 * IMPULSE - Database Seed Script
 * Creates 10 venues near your location + 10 users per venue (100 total)
 * All users are checked in to their venue with presence records
 * Run: node seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/Models/userRegisterModel");
const Venue = require("./src/Models/venueModel");
const VenuePresence = require("./src/Models/venuPresence");

// Center point — Hyderabad, India (adjust if needed)
const CENTER_LAT = 17.385;
const CENTER_LNG = 78.4867;

const VENUES = [
  { name: "Brew Haven Cafe", type: "cafe", description: "Artisan coffee and cozy vibes", city: "Hyderabad", state: "Telangana", tags: ["coffee","wifi","chill"], offset: [0.002, 0.001] },
  { name: "Skyline Rooftop Bar", type: "bar", description: "Craft cocktails with a city view", city: "Hyderabad", state: "Telangana", tags: ["cocktails","rooftop","nightlife"], offset: [0.004, -0.002] },
  { name: "Spice Garden Restaurant", type: "restaurant", description: "Authentic South Indian cuisine", city: "Hyderabad", state: "Telangana", tags: ["food","indian","family"], offset: [-0.003, 0.003] },
  { name: "Pulse Fitness Studio", type: "gym", description: "Modern gym with group classes", city: "Hyderabad", state: "Telangana", tags: ["fitness","yoga","crossfit"], offset: [0.001, 0.005] },
  { name: "Neon Nights Club", type: "club", description: "EDM and live DJ sets every weekend", city: "Hyderabad", state: "Telangana", tags: ["music","dancing","nightlife"], offset: [-0.005, -0.001] },
  { name: "Chapter One Library", type: "library", description: "Quiet reading space and book club", city: "Hyderabad", state: "Telangana", tags: ["books","quiet","study"], offset: [0.006, 0.002] },
  { name: "Green Trail Park", type: "park", description: "Jogging trails and open lawns", city: "Hyderabad", state: "Telangana", tags: ["nature","running","dogs"], offset: [-0.002, 0.006] },
  { name: "The Hive Coworking", type: "coworking", description: "Shared workspace for creators", city: "Hyderabad", state: "Telangana", tags: ["work","startup","networking"], offset: [0.003, -0.004] },
  { name: "Forum Mall", type: "mall", description: "Shopping, food court, and entertainment", city: "Hyderabad", state: "Telangana", tags: ["shopping","movies","food"], offset: [-0.004, -0.005] },
  { name: "Sunset Music Fest", type: "event", description: "Live music festival this weekend", city: "Hyderabad", state: "Telangana", tags: ["live music","festival","outdoor"], offset: [0.005, 0.004] },
];

// 100 people — 10 per venue, realistic names, bios, photos from randomuser.me/pravatar
const PEOPLE = [
  // Venue 0 — Brew Haven Cafe
  { name:"Aanya Sharma", gender:"female", age:24, dob:"2001-08-15", bio:"Coffee addict and bookworm. Love deep conversations over lattes.", hobbies:["Reading","Coffee","Travel","Music"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/1.jpg" },
  { name:"Rohan Mehta", gender:"male", age:26, dob:"1999-03-22", bio:"Software dev by day, guitarist by night. Always up for a jam session.", hobbies:["Music","Tech","Gaming","Cooking"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/1.jpg" },
  { name:"Priya Nair", gender:"female", age:23, dob:"2002-11-05", bio:"Aspiring photographer. I see beauty in the mundane.", hobbies:["Photography","Art","Hiking","Yoga"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/2.jpg" },
  { name:"Arjun Reddy", gender:"male", age:28, dob:"1997-06-18", bio:"Startup founder. Fueled by chai and ambition.", hobbies:["Tech","Fitness","Reading","Travel"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/2.jpg" },
  { name:"Meera Joshi", gender:"female", age:25, dob:"2000-01-30", bio:"Dance like nobody's watching. Salsa is my therapy.", hobbies:["Dancing","Music","Cooking","Movies"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/3.jpg" },
  { name:"Karthik Iyer", gender:"male", age:27, dob:"1998-09-12", bio:"Traveler. 15 countries and counting. Where to next?", hobbies:["Travel","Photography","Food","Hiking"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/3.jpg" },
  { name:"Sneha Patel", gender:"female", age:22, dob:"2003-04-25", bio:"Med student who loves painting on weekends.", hobbies:["Art","Reading","Yoga","Nature"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/4.jpg" },
  { name:"Vikram Singh", gender:"male", age:29, dob:"1996-12-08", bio:"Fitness coach. Let me help you find your best self.", hobbies:["Fitness","Sports","Cooking","Meditation"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/4.jpg" },
  { name:"Ananya Gupta", gender:"female", age:24, dob:"2001-07-19", bio:"Writer and dreamer. Currently working on my first novel.", hobbies:["Writing","Reading","Music","Travel"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/5.jpg" },
  { name:"Dev Kapoor", gender:"male", age:26, dob:"1999-02-14", bio:"Film buff and amateur chef. My biryani is legendary.", hobbies:["Movies","Cooking","Gaming","Music"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/5.jpg" },

  // Venue 1 — Skyline Rooftop Bar
  { name:"Ishita Verma", gender:"female", age:25, dob:"2000-05-20", bio:"Marketing exec who loves sunset cocktails and good company.", hobbies:["Travel","Fashion","Food","Dancing"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/6.jpg" },
  { name:"Rahul Desai", gender:"male", age:27, dob:"1998-10-03", bio:"Architect with a passion for mixology. I'll make you the perfect drink.", hobbies:["Art","Cooking","Music","Tech"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/6.jpg" },
  { name:"Kavya Menon", gender:"female", age:23, dob:"2002-08-11", bio:"Fashion designer. Life's too short for boring outfits.", hobbies:["Fashion","Art","Photography","Dancing"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/7.jpg" },
  { name:"Aditya Rao", gender:"male", age:30, dob:"1995-01-28", bio:"Investment banker who unwinds with jazz and whiskey.", hobbies:["Music","Reading","Travel","Fitness"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/7.jpg" },
  { name:"Riya Saxena", gender:"female", age:26, dob:"1999-12-15", bio:"Yoga instructor. Finding balance one pose at a time.", hobbies:["Yoga","Meditation","Nature","Cooking"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/8.jpg" },
  { name:"Nikhil Bhat", gender:"male", age:25, dob:"2000-04-07", bio:"Stand-up comedian. I promise I'm funnier in person.", hobbies:["Movies","Writing","Music","Travel"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/8.jpg" },
  { name:"Tara Krishnan", gender:"female", age:24, dob:"2001-06-22", bio:"Data scientist who paints galaxies on weekends.", hobbies:["Tech","Art","Reading","Hiking"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/9.jpg" },
  { name:"Sameer Malik", gender:"male", age:28, dob:"1997-03-09", bio:"DJ and music producer. Let me curate your playlist.", hobbies:["Music","Dancing","Tech","Gaming"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/9.jpg" },
  { name:"Pooja Hegde", gender:"female", age:27, dob:"1998-11-30", bio:"Travel blogger. 30 countries, infinite stories.", hobbies:["Travel","Photography","Writing","Food"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/10.jpg" },
  { name:"Varun Dhawan", gender:"male", age:26, dob:"1999-07-14", bio:"Personal trainer and nutrition geek. Gains are my game.", hobbies:["Fitness","Sports","Cooking","Nature"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/10.jpg" },

  // Venue 2 — Spice Garden Restaurant
  { name:"Divya Agarwal", gender:"female", age:25, dob:"2000-09-08", bio:"Foodie who rates restaurants for fun. Your taste buds will thank me.", hobbies:["Food","Cooking","Travel","Photography"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/11.jpg" },
  { name:"Siddharth Malhotra", gender:"male", age:29, dob:"1996-05-16", bio:"Chef turned entrepreneur. Building the next big food brand.", hobbies:["Cooking","Food","Tech","Travel"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/11.jpg" },
  { name:"Nisha Kumari", gender:"female", age:22, dob:"2003-02-28", bio:"College student with a passion for baking and K-dramas.", hobbies:["Cooking","Movies","Music","Art"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/12.jpg" },
  { name:"Pranav Kulkarni", gender:"male", age:27, dob:"1998-08-04", bio:"Food photographer. I eat with my eyes first.", hobbies:["Photography","Food","Travel","Hiking"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/12.jpg" },
  { name:"Shreya Ghoshal", gender:"female", age:24, dob:"2001-03-12", bio:"Classical singer who loves spicy food and sweet people.", hobbies:["Music","Cooking","Dancing","Yoga"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/13.jpg" },
  { name:"Manish Pandey", gender:"male", age:26, dob:"1999-10-21", bio:"Cricket enthusiast and weekend chef. My butter chicken is unmatched.", hobbies:["Sports","Cooking","Gaming","Movies"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/13.jpg" },
  { name:"Aditi Rao", gender:"female", age:28, dob:"1997-07-07", bio:"Nutritionist who believes food is medicine. Let's eat healthy together.", hobbies:["Food","Fitness","Nature","Reading"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/14.jpg" },
  { name:"Harsh Vardhan", gender:"male", age:25, dob:"2000-01-15", bio:"Wine sommelier in training. Pair me with your best conversation.", hobbies:["Food","Travel","Reading","Music"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/14.jpg" },
  { name:"Sakshi Tanwar", gender:"female", age:23, dob:"2002-06-30", bio:"Vegan chef spreading plant-based love one dish at a time.", hobbies:["Cooking","Nature","Yoga","Photography"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/15.jpg" },
  { name:"Rajesh Kumar", gender:"male", age:30, dob:"1995-11-18", bio:"Restaurant owner and food critic. I know every hidden gem in the city.", hobbies:["Food","Travel","Music","Sports"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/15.jpg" },

  // Venue 3 — Pulse Fitness Studio
  { name:"Simran Kaur", gender:"female", age:24, dob:"2001-04-10", bio:"CrossFit athlete. Strong is the new beautiful.", hobbies:["Fitness","Sports","Hiking","Cooking"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/16.jpg" },
  { name:"Abhishek Sharma", gender:"male", age:28, dob:"1997-09-25", bio:"Marathon runner. 42km is just a warm-up.", hobbies:["Fitness","Sports","Nature","Meditation"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/16.jpg" },
  { name:"Neha Dhupia", gender:"female", age:26, dob:"1999-12-03", bio:"Pilates instructor. Flexibility in body and mind.", hobbies:["Yoga","Fitness","Dancing","Music"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/17.jpg" },
  { name:"Kunal Khemu", gender:"male", age:27, dob:"1998-05-19", bio:"Boxing coach. I'll teach you to fight for what you love.", hobbies:["Sports","Fitness","Movies","Gaming"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/17.jpg" },
  { name:"Ankita Lokhande", gender:"female", age:25, dob:"2000-08-14", bio:"Zumba instructor. Life is better when you're dancing.", hobbies:["Dancing","Fitness","Music","Travel"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/18.jpg" },
  { name:"Rohit Shetty", gender:"male", age:29, dob:"1996-02-07", bio:"Bodybuilder and meal prep king. Discipline is freedom.", hobbies:["Fitness","Cooking","Sports","Tech"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/18.jpg" },
  { name:"Kiara Advani", gender:"female", age:23, dob:"2002-07-31", bio:"Yoga enthusiast seeking inner peace and good vibes.", hobbies:["Yoga","Meditation","Nature","Art"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/19.jpg" },
  { name:"Vicky Kaushal", gender:"male", age:26, dob:"1999-06-16", bio:"Swimming champion turned fitness influencer.", hobbies:["Fitness","Sports","Photography","Travel"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/19.jpg" },
  { name:"Bhumi Pednekar", gender:"female", age:27, dob:"1998-01-22", bio:"Wellness coach. Your health journey starts with one step.", hobbies:["Fitness","Cooking","Reading","Nature"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/20.jpg" },
  { name:"Tiger Shroff", gender:"male", age:25, dob:"2000-03-02", bio:"Martial artist and parkour enthusiast. Gravity is optional.", hobbies:["Sports","Fitness","Dancing","Movies"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/20.jpg" },

  // Venue 4 — Neon Nights Club
  { name:"Janhvi Kapoor", gender:"female", age:24, dob:"2001-03-06", bio:"Night owl and dance floor queen. The bass drops, so do I.", hobbies:["Dancing","Music","Fashion","Movies"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/21.jpg" },
  { name:"Kartik Aaryan", gender:"male", age:27, dob:"1998-11-22", bio:"Party planner and social butterfly. I know everyone.", hobbies:["Music","Dancing","Travel","Food"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/21.jpg" },
  { name:"Sara Ali Khan", gender:"female", age:25, dob:"2000-08-12", bio:"Bollywood dance lover. Knock knock — who's there? A good time.", hobbies:["Dancing","Movies","Travel","Fitness"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/22.jpg" },
  { name:"Ayushmann Khurrana", gender:"male", age:29, dob:"1996-09-14", bio:"Singer-songwriter. My guitar has more stories than me.", hobbies:["Music","Writing","Movies","Travel"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/22.jpg" },
  { name:"Disha Patani", gender:"female", age:26, dob:"1999-06-13", bio:"Model and fitness enthusiast. Living life in the fast lane.", hobbies:["Fashion","Fitness","Dancing","Photography"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/23.jpg" },
  { name:"Ranveer Singh", gender:"male", age:28, dob:"1997-07-06", bio:"Energy personified. I don't walk into rooms, I explode into them.", hobbies:["Music","Dancing","Fashion","Sports"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/23.jpg" },
  { name:"Alia Bhatt", gender:"female", age:23, dob:"2002-03-15", bio:"Actress and cat mom. Looking for someone who loves both.", hobbies:["Movies","Pets","Music","Art"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/24.jpg" },
  { name:"Siddhant Chaturvedi", gender:"male", age:26, dob:"1999-04-29", bio:"Rapper and actor. Apna time aayega.", hobbies:["Music","Writing","Fitness","Movies"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/24.jpg" },
  { name:"Kriti Sanon", gender:"female", age:27, dob:"1998-07-27", bio:"Engineer turned actress. I contain multitudes.", hobbies:["Movies","Reading","Travel","Dancing"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/25.jpg" },
  { name:"Adarsh Gourav", gender:"male", age:25, dob:"2000-10-10", bio:"Indie musician. My Spotify has 3 listeners and I love all of them.", hobbies:["Music","Writing","Art","Movies"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/25.jpg" },

  // Venue 5 — Chapter One Library
  { name:"Radhika Apte", gender:"female", age:28, dob:"1997-09-07", bio:"Literature professor. Let's debate Dostoevsky over chai.", hobbies:["Reading","Writing","Art","Music"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/26.jpg" },
  { name:"Irrfan Patel", gender:"male", age:30, dob:"1995-01-07", bio:"Librarian and history nerd. I judge books by their content.", hobbies:["Reading","Writing","Travel","Music"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/26.jpg" },
  { name:"Sobhita Dhulipala", gender:"female", age:25, dob:"2000-05-31", bio:"Poet and philosophy student. Words are my weapon.", hobbies:["Writing","Reading","Art","Meditation"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/27.jpg" },
  { name:"Nawazuddin Siddiqui", gender:"male", age:29, dob:"1996-05-19", bio:"Theater actor. The stage is my second home.", hobbies:["Art","Reading","Movies","Writing"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/27.jpg" },
  { name:"Sanya Malhotra", gender:"female", age:24, dob:"2001-02-25", bio:"Bookstagrammer with 50k followers. Currently reading Murakami.", hobbies:["Reading","Photography","Writing","Travel"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/28.jpg" },
  { name:"Rajkummar Rao", gender:"male", age:27, dob:"1998-08-31", bio:"Screenwriter working on my first feature film.", hobbies:["Writing","Movies","Reading","Music"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/28.jpg" },
  { name:"Tripti Dimri", gender:"female", age:23, dob:"2002-02-23", bio:"Art history student. Every painting tells a story.", hobbies:["Art","Reading","Music","Travel"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/29.jpg" },
  { name:"Dulquer Salmaan", gender:"male", age:28, dob:"1997-07-28", bio:"Multilingual bookworm. I read in 4 languages.", hobbies:["Reading","Travel","Music","Movies"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/29.jpg" },
  { name:"Mrunal Thakur", gender:"female", age:26, dob:"1999-08-01", bio:"Journalist and true crime podcast host.", hobbies:["Writing","Reading","Tech","Movies"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/30.jpg" },
  { name:"Pankaj Tripathi", gender:"male", age:30, dob:"1995-09-05", bio:"Philosophy teacher. I think, therefore I swipe right.", hobbies:["Reading","Writing","Meditation","Nature"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/30.jpg" },

  // Venue 6 — Green Trail Park
  { name:"Fatima Sana", gender:"female", age:24, dob:"2001-01-09", bio:"Dog mom and trail runner. My golden retriever approves all dates.", hobbies:["Pets","Hiking","Nature","Fitness"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/31.jpg" },
  { name:"Arijit Sen", gender:"male", age:26, dob:"1999-04-25", bio:"Bird watcher and nature photographer. Patience is my superpower.", hobbies:["Nature","Photography","Hiking","Reading"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/31.jpg" },
  { name:"Rashmika Mandanna", gender:"female", age:25, dob:"2000-04-05", bio:"Morning jogger and sunset chaser. Nature heals everything.", hobbies:["Nature","Fitness","Photography","Yoga"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/32.jpg" },
  { name:"Vijay Deverakonda", gender:"male", age:28, dob:"1997-05-09", bio:"Rock climber and adventure seeker. Mountains are calling.", hobbies:["Hiking","Sports","Nature","Travel"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/32.jpg" },
  { name:"Samantha Ruth", gender:"female", age:27, dob:"1998-04-28", bio:"Environmentalist. Planting trees and spreading love.", hobbies:["Nature","Yoga","Cooking","Pets"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/33.jpg" },
  { name:"Nani Ghanta", gender:"male", age:25, dob:"2000-02-24", bio:"Cyclist who has pedaled across 5 states.", hobbies:["Sports","Nature","Travel","Photography"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/33.jpg" },
  { name:"Keerthy Suresh", gender:"female", age:23, dob:"2002-10-17", bio:"Sketching landscapes in the park. Art meets nature.", hobbies:["Art","Nature","Hiking","Music"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/34.jpg" },
  { name:"Mahesh Babu", gender:"male", age:29, dob:"1996-08-09", bio:"Marathon trainer. Running is meditation in motion.", hobbies:["Fitness","Nature","Sports","Meditation"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/34.jpg" },
  { name:"Nithya Menen", gender:"female", age:26, dob:"1999-04-08", bio:"Organic gardener and tea enthusiast. Growing my own happiness.", hobbies:["Nature","Cooking","Reading","Yoga"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/35.jpg" },
  { name:"Ram Charan", gender:"male", age:27, dob:"1998-03-27", bio:"Horse rider and outdoor enthusiast. Freedom is an open field.", hobbies:["Sports","Nature","Fitness","Travel"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/35.jpg" },

  // Venue 7 — The Hive Coworking
  { name:"Shraddha Kapoor", gender:"female", age:25, dob:"2000-03-03", bio:"UX designer building products people love.", hobbies:["Tech","Art","Music","Reading"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/36.jpg" },
  { name:"Farhan Akhtar", gender:"male", age:30, dob:"1995-01-09", bio:"Serial entrepreneur. Failed twice, succeeded thrice.", hobbies:["Tech","Music","Fitness","Travel"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/36.jpg" },
  { name:"Taapsee Pannu", gender:"female", age:27, dob:"1998-08-01", bio:"Product manager at a fintech startup. Data drives my decisions.", hobbies:["Tech","Reading","Sports","Travel"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/37.jpg" },
  { name:"Hrithik Roshan", gender:"male", age:29, dob:"1996-01-10", bio:"AI researcher. Teaching machines to think so I don't have to.", hobbies:["Tech","Fitness","Reading","Gaming"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/37.jpg" },
  { name:"Deepika Padukone", gender:"female", age:26, dob:"1999-01-05", bio:"Startup founder in edtech. Education should be accessible to all.", hobbies:["Tech","Reading","Yoga","Travel"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/38.jpg" },
  { name:"Shah Rukh Khan", gender:"male", age:28, dob:"1997-11-02", bio:"Full-stack developer and open source contributor.", hobbies:["Tech","Gaming","Music","Cooking"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/38.jpg" },
  { name:"Anushka Sharma", gender:"female", age:24, dob:"2001-05-01", bio:"Content creator and social media strategist.", hobbies:["Writing","Photography","Fashion","Tech"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/39.jpg" },
  { name:"Ranbir Kapoor", gender:"male", age:27, dob:"1998-09-28", bio:"Venture capitalist. I invest in people, not just ideas.", hobbies:["Tech","Travel","Reading","Sports"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/39.jpg" },
  { name:"Kangana Ranaut", gender:"female", age:28, dob:"1997-03-23", bio:"Freelance graphic designer. Pixels are my playground.", hobbies:["Art","Tech","Music","Movies"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/40.jpg" },
  { name:"Akshay Kumar", gender:"male", age:26, dob:"1999-09-09", bio:"DevOps engineer. I break things in production so you don't have to.", hobbies:["Tech","Fitness","Gaming","Cooking"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/40.jpg" },

  // Venue 8 — Forum Mall
  { name:"Nora Fatehi", gender:"female", age:25, dob:"2000-02-06", bio:"Fashion influencer and shopaholic. Retail therapy is real therapy.", hobbies:["Fashion","Dancing","Music","Travel"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/41.jpg" },
  { name:"Varun Sharma", gender:"male", age:27, dob:"1998-02-04", bio:"Stand-up comedian. I'll make you laugh till your cheeks hurt.", hobbies:["Movies","Music","Food","Gaming"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/41.jpg" },
  { name:"Jacqueline Fernandez", gender:"female", age:26, dob:"1999-08-11", bio:"Fitness model and smoothie bowl artist.", hobbies:["Fitness","Food","Fashion","Travel"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/42.jpg" },
  { name:"Rajkumar Hirani", gender:"male", age:30, dob:"1995-11-20", bio:"Film director. Every person has a story worth telling.", hobbies:["Movies","Writing","Travel","Music"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/42.jpg" },
  { name:"Katrina Kaif", gender:"female", age:24, dob:"2001-07-16", bio:"Dance instructor and movie buff. Bollywood runs in my veins.", hobbies:["Dancing","Movies","Fitness","Music"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/43.jpg" },
  { name:"Sushant Rajput", gender:"male", age:28, dob:"1997-01-21", bio:"Astrophysics enthusiast. Let's stargaze and talk about the universe.", hobbies:["Reading","Tech","Nature","Music"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/43.jpg" },
  { name:"Madhuri Dixit", gender:"female", age:27, dob:"1998-05-15", bio:"Classical dancer turned contemporary. Grace in every move.", hobbies:["Dancing","Music","Yoga","Art"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/44.jpg" },
  { name:"Salman Khan", gender:"male", age:29, dob:"1996-12-27", bio:"Philanthropist and fitness enthusiast. Being human is my brand.", hobbies:["Fitness","Sports","Cooking","Pets"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/44.jpg" },
  { name:"Priyanka Chopra", gender:"female", age:28, dob:"1997-07-18", bio:"Global citizen. Worked in 3 countries, loved in all of them.", hobbies:["Travel","Music","Fashion","Food"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/45.jpg" },
  { name:"Aamir Khan", gender:"male", age:26, dob:"1999-03-14", bio:"Perfectionist filmmaker. I only do things that matter.", hobbies:["Movies","Reading","Travel","Sports"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/45.jpg" },

  // Venue 9 — Sunset Music Fest
  { name:"Shreya Ghosal", gender:"female", age:24, dob:"2001-03-12", bio:"Singer-songwriter. My voice is my instrument, my heart is the melody.", hobbies:["Music","Writing","Dancing","Travel"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/46.jpg" },
  { name:"AR Rahman", gender:"male", age:30, dob:"1995-01-06", bio:"Music producer. Beats, rhythms, and infinite possibilities.", hobbies:["Music","Tech","Meditation","Art"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/46.jpg" },
  { name:"Sunidhi Chauhan", gender:"female", age:26, dob:"1999-08-14", bio:"Rock vocalist. My playlist has no genre boundaries.", hobbies:["Music","Dancing","Travel","Fitness"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/47.jpg" },
  { name:"Amit Trivedi", gender:"male", age:28, dob:"1997-04-08", bio:"Indie musician. Every chord tells a different story.", hobbies:["Music","Writing","Movies","Nature"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/47.jpg" },
  { name:"Neeti Mohan", gender:"female", age:25, dob:"2000-11-18", bio:"Playback singer and music teacher. Spreading joy through melody.", hobbies:["Music","Dancing","Yoga","Cooking"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/48.jpg" },
  { name:"Vishal Dadlani", gender:"male", age:29, dob:"1996-06-28", bio:"Band frontman. We play loud and live free.", hobbies:["Music","Sports","Travel","Food"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/48.jpg" },
  { name:"Monali Thakur", gender:"female", age:23, dob:"2002-11-03", bio:"Flute player and classical music lover. Serenity in every note.", hobbies:["Music","Meditation","Art","Nature"], interestedIn:"male", photo:"https://randomuser.me/api/portraits/women/49.jpg" },
  { name:"Badshah Rapper", gender:"male", age:27, dob:"1998-11-19", bio:"Hip-hop artist. Dropping bars and breaking hearts.", hobbies:["Music","Dancing","Fashion","Gaming"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/49.jpg" },
  { name:"Dhvani Bhanushali", gender:"female", age:24, dob:"2001-03-22", bio:"Pop singer and guitar player. Music is my love language.", hobbies:["Music","Travel","Photography","Movies"], interestedIn:"everyone", photo:"https://randomuser.me/api/portraits/women/50.jpg" },
  { name:"Nucleya Bass", gender:"male", age:26, dob:"1999-10-30", bio:"Electronic music producer. Bass is the heartbeat of the night.", hobbies:["Music","Tech","Dancing","Art"], interestedIn:"female", photo:"https://randomuser.me/api/portraits/men/50.jpg" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear old seed data (keep real users)
    const seedEmails = PEOPLE.map(p => p.name.toLowerCase().replace(/\s+/g, ".") + "@impulse.test");
    await User.deleteMany({ email: { $in: seedEmails } });
    await Venue.deleteMany({ ownerEmail: "seed@impulse.test" });
    await VenuePresence.deleteMany({});
    console.log("Cleared old seed data");

    const hashedPw = await bcrypt.hash("Test1234!", 10);

    // Create venues
    const createdVenues = [];
    for (const v of VENUES) {
      const venue = await Venue.create({
        name: v.name,
        type: v.type,
        description: v.description,
        city: v.city,
        state: v.state,
        country: "India",
        tags: v.tags,
        ownerEmail: "seed@impulse.test",
        location: {
          type: "Point",
          coordinates: [CENTER_LNG + v.offset[1], CENTER_LAT + v.offset[0]]
        },
        radiusMeters: 200,
        capacity: 100,
        isActive: true,
        isDeleted: false,
        operatingHours: { open: "08:00", close: "23:00" }
      });
      createdVenues.push(venue);
      console.log(`  Venue: ${venue.name} (${venue.type})`);
    }

    // Create users — 10 per venue
    let userCount = 0;
    for (let vi = 0; vi < createdVenues.length; vi++) {
      const venue = createdVenues[vi];
      const batch = PEOPLE.slice(vi * 10, vi * 10 + 10);

      for (const p of batch) {
        const email = p.name.toLowerCase().replace(/\s+/g, ".") + "@impulse.test";
        const user = await User.create({
          name: p.name,
          email,
          password: hashedPw,
          dateOfBirth: new Date(p.dob),
          age: p.age,
          gender: p.gender,
          interestedIn: p.interestedIn,
          hobbies: p.hobbies,
          interests: p.hobbies,
          bio: p.bio,
          photos: [p.photo],
          isregistered: true,
          role: "user",
          status: "Active",
          activeVenueId: venue._id,
          lastActiveAt: new Date()
        });

        // Create presence so they show up in discover
        await VenuePresence.create({
          userId: user._id,
          venueId: venue._id,
          lastSeenAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h presence
        });

        userCount++;
      }

      // Update venue occupancy
      const count = await VenuePresence.countDocuments({ venueId: venue._id });
      await Venue.findByIdAndUpdate(venue._id, { currentOccupancy: count });
      console.log(`  ${venue.name}: ${count} people checked in`);
    }

    console.log(`\nSeed complete: ${createdVenues.length} venues, ${userCount} users`);
    console.log(`\nTest login: any_name@impulse.test / Test1234!`);
    console.log(`Example: aanya.sharma@impulse.test / Test1234!`);
    console.log(`\nCenter location: ${CENTER_LAT}, ${CENTER_LNG} (Hyderabad)`);

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
