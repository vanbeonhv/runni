# Development Roadmap

## Project Timeline

**Target MVP Launch:** 6-8 weeks from project start
**Estimated Total MVP Effort:** 150-200 hours

---

## Phase 1: Foundation (Week 1-2)
**Goal:** Set up infrastructure and basic authentication

### Week 1: Backend Setup
**Estimated:** 20 hours

#### Tasks:
- [x] Initialize NestJS project
- [ ] Set up Prisma with PostgreSQL
- [ ] Create database schema and run migrations
- [ ] Set up environment configuration
- [ ] Create base modules:
  - [ ] Auth module
  - [ ] Users module
  - [ ] Plans module
  - [ ] Workouts module
  - [ ] Strava module
- [ ] Configure Swagger API documentation

**Deliverables:**
- Working NestJS server
- Database with all tables
- Basic API structure

---

### Week 2: Authentication & Frontend Setup
**Estimated:** 20 hours

#### Backend:
- [ ] Implement Strava OAuth flow
  - [ ] Authorization endpoint
  - [ ] Callback handler
  - [ ] Token exchange
  - [ ] Token refresh logic
- [ ] JWT authentication setup
- [ ] Auth guards and decorators
- [ ] User CRUD operations

#### Frontend:
- [x] Initialize React + Vite project
- [ ] Set up TailwindCSS
- [ ] Configure React Router
- [ ] Create base layout components
- [ ] Set up API client (axios)
- [ ] Create auth context/hooks

**Deliverables:**
- User can log in via Strava
- Protected routes working
- Basic UI shell

---

## Phase 2: Core Features (Week 3-4)
**Goal:** Training plan creation and workout display

### Week 3: Training Plan Management
**Estimated:** 25 hours

#### Backend:
- [ ] Training plan CRUD endpoints
- [ ] Plan template system
  - [ ] Half marathon template (hardcoded)
  - [ ] Workout generation logic
- [ ] Business logic:
  - [ ] Calculate plan start date
  - [ ] Generate workouts for all weeks
  - [ ] Validate race date
- [ ] Plan queries:
  - [ ] Get active plan
  - [ ] Get plan with workouts
  - [ ] Get workouts by week

#### Frontend:
- [ ] Plan creation flow (onboarding)
  - [ ] Distance selector
  - [ ] Date picker
  - [ ] Confirmation screen
- [ ] Plan overview page
  - [ ] Plan card component
  - [ ] Progress indicators
  - [ ] Week navigation

**Deliverables:**
- User can create a 16-week half marathon plan
- Plan displays with all workouts
- Week-by-week navigation

---

### Week 4: Workout Display & Calendar
**Estimated:** 25 hours

#### Backend:
- [ ] Workout endpoints
  - [ ] Get workout by ID
  - [ ] Get workouts by week
  - [ ] Get today's workout
- [ ] Workout completion logic (manual)
- [ ] Update workout status

#### Frontend:
- [ ] Today/Dashboard page
  - [ ] Today's workout card
  - [ ] Week summary
  - [ ] Quick stats
- [ ] Calendar/Week view
  - [ ] Weekly calendar component
  - [ ] Workout cards
  - [ ] Color-coded by type
  - [ ] Completion status badges
- [ ] Workout detail page
  - [ ] Full workout info
  - [ ] Manual completion button

**Deliverables:**
- User can view all workouts
- User can navigate by week
- User can manually complete workouts
- Mobile-responsive UI

---

## Phase 3: Strava Integration (Week 5-6)
**Goal:** Automatic activity syncing and matching

### Week 5: Strava Webhook Setup
**Estimated:** 25 hours

#### Backend:
- [ ] Webhook subscription management
  - [ ] Create subscription on server start
  - [ ] Verify subscription endpoint
  - [ ] Handle webhook events
- [ ] Webhook event processing
  - [ ] Save events to database
  - [ ] Queue system (optional: Bull)
  - [ ] Process events async
- [ ] Strava API client
  - [ ] Get activity by ID
  - [ ] Fetch full activity details
  - [ ] Handle rate limits
  - [ ] Token refresh integration
- [ ] Activity storage
  - [ ] Save activities to database
  - [ ] Parse relevant fields
  - [ ] Store raw JSON

**Deliverables:**
- Webhook receives Strava events
- Activities fetched and stored
- Event processing is reliable

---

### Week 6: Auto-Matching & Activity Display
**Estimated:** 25 hours

#### Backend:
- [ ] Auto-match algorithm
  - [ ] Match by date
  - [ ] Match by distance (±10%)
  - [ ] Match by sport type
  - [ ] Handle edge cases
- [ ] Completion linking
  - [ ] Create workout_completion record
  - [ ] Update workout.completed_at
  - [ ] Handle manual overrides
- [ ] Activities API
  - [ ] List all activities
  - [ ] Filter by date range
  - [ ] Include completion status

#### Frontend:
- [ ] Activities page
  - [ ] Activity list component
  - [ ] Date filters
  - [ ] Display metrics (distance, pace, time)
  - [ ] Show matched workout (if any)
- [ ] Update workout cards
  - [ ] Show linked activity
  - [ ] Display activity metrics
  - [ ] Completion indicators
- [ ] Manual linking UI
  - [ ] Select activity dropdown
  - [ ] Confirm/cancel actions

**Deliverables:**
- Strava activities auto-match workouts
- User sees completed workouts
- Activities page functional
- Manual matching works

---

## Phase 4: Polish & Testing (Week 7-8)
**Goal:** Bug fixes, UX improvements, deployment prep

### Week 7: Polish & Edge Cases
**Estimated:** 20 hours

#### Backend:
- [ ] Error handling improvements
- [ ] Logging setup (Winston/Pino)
- [ ] Validation on all endpoints
- [ ] Handle edge cases:
  - [ ] Multiple activities same day
  - [ ] Activities before plan start
  - [ ] Deleted Strava activities
  - [ ] Plan date changes
- [ ] Performance optimization
  - [ ] Query optimization
  - [ ] Add indexes
  - [ ] Caching (if needed)

#### Frontend:
- [ ] Loading states everywhere
- [ ] Error boundaries
- [ ] Empty states
- [ ] Success/error toasts
- [ ] Mobile optimization
- [ ] Accessibility improvements
- [ ] Color contrast fixes

**Deliverables:**
- Smooth user experience
- No crashes
- Clear error messages
- Fast page loads

---

### Week 8: Testing & Deployment
**Estimated:** 20 hours

#### Testing:
- [ ] Manual testing checklist
- [ ] Test all user flows
- [ ] Test with real Strava account
- [ ] Cross-browser testing
- [ ] Mobile device testing

#### Deployment:
- [ ] Set up production database (Railway/Supabase)
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Configure environment variables
- [ ] Set up domain (optional)
- [ ] Configure Strava app callback URLs
- [ ] SSL/HTTPS verification
- [ ] Create webhook subscription in production
- [ ] Monitor logs

#### Documentation:
- [ ] README with setup instructions
- [ ] API documentation (Swagger)
- [ ] Deployment guide
- [ ] Known issues list

**Deliverables:**
- MVP live in production
- Fully functional app
- Documentation complete

---

## Post-MVP Roadmap

### Phase 5: Iteration & Feedback (Week 9-12)
**Estimated:** 40 hours

#### Goals:
- Gather user feedback
- Fix critical bugs
- Improve UX based on usage data
- Add small quality-of-life features

#### Possible Additions:
- [ ] Workout notes/feedback
- [ ] Basic statistics page
- [ ] Export plan to calendar
- [ ] Email notifications
- [ ] Better onboarding flow
- [ ] Profile page

---

### Phase 6: Phase 2 Features (Month 4-5)
**Estimated:** 60-80 hours

See FEATURES.md Phase 2:
- Pace insights
- Week summaries
- Notifications
- Custom workouts
- Rearrange workouts

---

### Phase 7: Advanced Features (Month 6+)
**Estimated:** 100+ hours

See FEATURES.md Phase 3:
- Multiple plan templates
- Adaptive training
- Analytics dashboard
- Social features

---

## Development Principles

### During MVP:
1. **Ship fast, iterate faster**
   - Don't over-engineer
   - Hardcode where reasonable
   - Focus on happy path first

2. **Mobile-first always**
   - Design for mobile screens
   - Desktop is enhancement

3. **Real data early**
   - Test with actual Strava account
   - Use real workout templates
   - Don't mock too much

4. **Code for clarity**
   - Readable > clever
   - Comments for complex logic
   - Consistent naming

---

## Risk Mitigation

### High-Risk Items:

#### 1. Strava API Rate Limits
**Risk:** Exceeding 200 req/15min or 2000 req/day
**Mitigation:**
- Cache activity data
- Batch webhook processing
- Monitor usage
- Implement exponential backoff

#### 2. Webhook Reliability
**Risk:** Missing events or duplicate processing
**Mitigation:**
- Log all events to database
- Idempotent processing (check if already processed)
- Retry logic for failed processing
- Manual sync button as backup

#### 3. Auto-Matching Accuracy
**Risk:** False positives/negatives in workout matching
**Mitigation:**
- Conservative matching (strict tolerance)
- Manual override always available
- Show matching confidence
- Allow user to unlink

#### 4. Token Expiration
**Risk:** Access tokens expire, sync fails
**Mitigation:**
- Automatic refresh before expiry
- Graceful degradation
- Re-auth prompt if refresh fails
- Monitor token health

---

## Success Criteria

### Week 2 Checkpoint:
- [ ] User can log in with Strava
- [ ] Database fully set up
- [ ] Frontend routing works

### Week 4 Checkpoint:
- [ ] User can create plan
- [ ] All workouts display correctly
- [ ] Week navigation works

### Week 6 Checkpoint:
- [ ] Strava activities sync automatically
- [ ] Auto-matching works for most cases
- [ ] Activities page functional

### Week 8 (MVP Launch):
- [ ] All core features working
- [ ] Deployed to production
- [ ] Minimal bugs
- [ ] Documentation complete

---

## Team Allocation (If Solo)

**Solo Developer Weekly Breakdown:**
- **Planning/Design:** 2-3 hours
- **Backend Development:** 8-10 hours
- **Frontend Development:** 8-10 hours
- **Testing:** 2-3 hours
- **Documentation:** 1-2 hours

**Total Weekly:** ~20-25 hours

---

## Tools & Resources

### Development:
- **IDE:** VS Code with Claude Code
- **API Testing:** Postman / Insomnia
- **Database Client:** Prisma Studio / pgAdmin
- **Git:** GitHub

### Monitoring (Post-Launch):
- Sentry for error tracking
- Vercel Analytics for frontend
- Railway logs for backend
- PostgreSQL slow query log

### Design:
- Figma (optional mockups)
- Excalidraw for diagrams
- Tailwind UI components for inspiration

---

## Next Immediate Steps

### Right Now:
1. ✅ Review all documentation
2. 🔄 Set up database with Prisma
3. 🔄 Create first migration
4. ⏭️ Implement auth module
5. ⏭️ Build login page

### This Week:
- Complete Phase 1 Week 1 tasks
- Get NestJS server running with database
- Create first API endpoint
- Test with Postman

### This Month:
- Complete Phase 1 & Phase 2
- Have working plan creation
- Display workouts in calendar view
- Basic UI polished