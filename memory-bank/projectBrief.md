# Dream Image Generator

## Overview
Dream Image Generator is an interactive web application that transforms user inputs (images or text) into AI-generated images using Google's Gemini API. There will some pre define themes like image generation for intstagram post, image create for linked post, etc. we have one page for storing prompt it is know as prompt library where user can use some customised prompt directly in one click. 
Add comments for code change for future refernce and uderstanding. 

## Features
- Text-to-image generation
- Image-to-image transformation
- Real-time image preview
- prompt-library it have public prompt ready to use
- User-friendly interface

## Technical Stack
### Frontend
- Next.js 14.2.8
- React 18.3.1
- typescript
- Tailwind CSS (for styling)
### Server
- vercel application deployment
- supabase for database, authentication

### AI Integration
- Google Gemini API (@google/generative-ai)

## Project Flow
1. User Input
   - Accept text descriptions
   - Accept image uploads
2. Processing
   - Send inputs to Gemini API
   - Handle API responses
3. Output
   - Display generated images
   - Enable download/sharing options

## Development Requirements
- Node.js 18+
- Google Cloud API key
- Environment variables setup for API keys