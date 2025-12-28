# Product Requirements Document: Music Taste Roaster

**Author:** Archit
**Version:** 2.0
**Date:** 2025-12-28

---

## 1. Overview

**Music Taste Roaster** is an AI-powered web application that playfully "roasts" a user's music taste. It connects to their music streaming service (either Spotify or Apple Music), analyzes their listening habits, and uses a Large Language Model (Google's Gemini) to generate a humorous, personalized, and "brutally honest" critique of their musical preferences, delivered in a "desi" (Hindi-English) style.

## 2. Target Audience

*   **Primary:** Social media-savvy Gen Z and Millennials (ages 16-30) who enjoy sharing memes, online trends, and personalized quiz/generator results.
*   **Secondary:** Casual music listeners who are curious about what their listening data says about them and enjoy a good-natured roast.

## 3. User Persona

*   **Name:** Rohan
*   **Age:** 22
*   **Occupation:** University Student
*   **Bio:** Rohan is an active user of Instagram and Twitter. He loves discovering new music, sharing memes with friends, and participating in online trends. He uses Spotify daily to listen to a mix of Indian artists, global pop, and hip-hop. He's curious, loves humor, and would be highly likely to share a funny "roast" of his music taste on his social media stories.

## 4. User Stories

*   **As a user, I want to...**
    *   Connect my Spotify account so the app can see my favorite artists and tracks.
    *   Connect my Apple Music account so the app can analyze my listening habits.
    *   Receive a unique, funny, and personalized roast of my music taste.
    *   See a summary of the music data that was used to generate the roast.
    *   Easily share a screenshot of my roast with my friends on social media.
    *   Be able to use the app on both my desktop and mobile browser.

## 5. Features & Scope

### 5.1. Core Features (MVP)

| Feature ID | Feature Name | Description | Priority |
|---|---|---|---|
| F-01 | Music Service Selection | On the landing page, users can choose to connect with either Spotify or Apple Music. | Must-have |
| F-02 | Spotify Authentication | Securely connect to a user's Spotify account using OAuth 2.0. | Must-have |
| F-03 | Apple Music Authentication | Securely connect to a user's Apple Music account using MusicKit JS. | Must-have |
| F-04 | Music Data Analysis (Spotify) | Fetch user's top artists, top tracks, recently played, and followed artists. | Must-have |
| F-05 | Music Data Analysis (Apple Music) | Fetch user's heavy rotation, recently played, and library songs. | Must-have |
| F-06 | AI Roast Generation | Send the collected music data to the Gemini AI with a prompt to generate a roast. | Must-have |
| F-07 | Roast Display | Display the generated roast in a clean, readable, and shareable format. | Must-have |
| F-08 | Data Summary Display | Show the user a summary of the artists/tracks that the roast was based on. | Must-have |
| F-09 | Responsive UI | The application should be well-designed and functional on both desktop and mobile devices. | Must-have |

### 5.2. Out of Scope (for this version)

*   User accounts or profiles (sessions are ephemeral).
*   Saving or history of roasts.
*   Sharing the roast directly to social media platforms (users can screenshot).
*   Support for other music services (e.g., YouTube Music, Amazon Music).

## 6. User Flow

1.  **Landing Page:** User visits the app and is greeted with a "Roast My Music Taste" button.
2.  **Service Selection:** The user chooses between "Connect with Spotify" and "Connect with Apple Music".
3.  **Authentication:**
    *   **Spotify:** User is redirected to Spotify to authorize the app. They are then redirected back to the app's `/callback` route.
    *   **Apple Music:** User is prompted to authorize the app within the browser using MusicKit JS.
4.  **Loading Screen:** The app shows a loading animation while it fetches music data and generates the roast.
5.  **Roast Display:** The app displays the AI-generated roast along with a summary of the user's music data.
6.  **Error Handling:** If at any point there is an error (e.g., failed authentication, not enough music data), the user is shown a clear error message.

## 7. Technical Requirements

*   **Frontend:** React, Vite, `react-router-dom`, `framer-motion` (for animations).
*   **Backend:** Node.js, Express.
*   **APIs:**
    *   Spotify Web API
    *   Apple Music API (via MusicKit JS on the frontend)
    *   Google Gemini AI API
*   **Authentication:** OAuth 2.0 for Spotify, JWT-based for Apple Music.
*   **Hosting:** The application should be deployable on a standard Node.js hosting environment.

## 8. Design & UX

*   **Visual Style:** Dark mode, with vibrant accents. The "fire" or "roast" theme should be subtly incorporated.
*   **Animations:** Use smooth, purposeful animations (`framer-motion`) to enhance the user experience during screen transitions.
*   **Readability:** The final roast text should be large, clear, and easy to read.
*   **Mobile-First:** The design should be responsive and optimized for mobile viewing, as this is where most sharing will occur.

## 9. Success Metrics

*   **User Engagement:** Number of roasts generated per day.
*   **Social Sharing:** Mentions and shares of the app on social media platforms (tracked via analytics or searches).
*   **Conversion Rate:** Percentage of users who land on the page and successfully generate a roast.
*   **User Feedback:** Positive reviews and feedback from users.

## 10. Future Enhancements

*   **"Roast Intensity" Setting:** Allow users to choose between a "light roast" and a "dark roast" for different levels of savagery.
*   **Shareable Image Generation:** Instead of users taking a screenshot, the app could generate a well-designed image of the roast that is perfect for sharing on social media.
*   **Playlist Generation:** Create a Spotify/Apple Music playlist of the user's "most roast-worthy" songs.
*   **Support for More Services:** Add support for YouTube Music, Amazon Music, etc.
*   **User Accounts:** Allow users to save their roast history.
---
