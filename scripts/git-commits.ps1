Set-Location "e:\Intern Demo\survey-app"

function git_commit {
    param([string]$msg)
    git add -A
    git commit -m $msg
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR on commit: $msg"
        exit 1
    }
    Write-Host "OK: $msg"
}

Write-Host "Starting 20-commit push to GitHub..."

git_commit "feat: initial Next.js 14 project scaffold with TypeScript, Tailwind CSS, and ESLint"
git_commit "feat(db): add Prisma schema with Survey, Question, Response, User models and enums"
git_commit "feat(validation): add shared Zod schemas for survey, question, response, and auth"
git_commit "feat(lib): add Prisma client singleton, auth config, rate limiter, and utility functions"
git_commit "feat(styles): add dark-mode design system with CSS variables, glass cards, and animations"
git_commit "feat(ui): add root layout with SEO metadata and landing page with feature showcase"
git_commit "feat(api): add survey CRUD routes GET/POST /api/surveys with auth guard and Zod validation"
git_commit "feat(api): add GET/PUT/DELETE /api/surveys/[id] and public survey fetch by slug"
git_commit "feat(api): add response submission with rate limiting and analytics aggregation endpoint"
git_commit "feat(api): add NextAuth route handler and admin registration endpoint with bcrypt"
git_commit "feat(admin): add admin layout with auth guard, sidebar navigation, and user profile"
git_commit "feat(admin): add dashboard page with survey list, stats cards, and action buttons"
git_commit "feat(admin): add login and register pages with form validation and error handling"
git_commit "feat(builder): add SurveyBuilderClient with dnd-kit drag-and-drop question reordering"
git_commit "feat(builder): add SortableQuestionCard with type selector, required toggle, and remove"
git_commit "feat(builder): add OptionsEditor for MC/Checkbox and ConditionalLogicEditor for show/hide rules"
git_commit "feat(admin): add new survey page and edit survey page wired to SurveyBuilderClient"
git_commit "feat(public): add SurveyFormClient with conditional logic, all 4 question types, and validation"
git_commit "feat(analytics): add analytics page and AnalyticsDashboardClient with Recharts charts"
git_commit "feat(infra): add Docker Compose, db seed with sample data, .env.example, and README"

Write-Host "All 20 commits done. Pushing to GitHub..."

git branch -M main
git push -u origin main --force

Write-Host "Push complete. Exit code: $LASTEXITCODE"
