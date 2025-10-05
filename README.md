# NourishNote

## Inspiration
AI is underutilized in supporting emotional well-being, particularly around managing eating habits. We wanted to explore how AI could provide empathetic, real-time guidance to help users better understand and manage their relationship with food.

## What it does
Alia is an AI-powered Emotional Eating Coach that delivers real-time, personalized support. By analyzing users’ journal entries, mood patterns, and environmental data, Alia provides empathetic advice, actionable insights, and guidance to help users identify emotional triggers and build self-regulation habits.

## How we built it
- **Frontend:** Next.js  
- **AI & Embeddings:** Gemini, LangChain  
- **Database & Authentication:** Supabase, Datastax  

## Challenges we ran into
Building a real-time Retrieval-Augmented Generation (RAG) system that processes sensitive user data efficiently while delivering relevant and timely guidance.

## Accomplishments
- Implemented a robust RAG system that integrates user context to deliver personalized, empathetic AI support.  
- Designed a private conversational interface that encourages self-reflection and emotional awareness.

## What we learned
- How to effectively use LangChain and vector databases for contextual AI retrieval.  
- Techniques for integrating embeddings, user data, and AI responses in real-time applications.

## What's next
- Expand personalization and context handling to deliver more accurate and actionable insights.  
- Add observability and reliability infrastructure to ensure smooth production deployment.  
- Continue improving the conversational experience for users, blending AI empathy with behavioral awareness.
