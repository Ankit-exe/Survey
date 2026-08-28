import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@surveyflow.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@surveyflow.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin user: ${admin.email} (password: admin123)`);

  // Create a sample survey
  const survey = await prisma.survey.create({
    data: {
      title: "Employee Satisfaction Survey",
      description: "Help us improve your workplace experience by sharing your feedback.",
      slug: "employee-satisfaction",
      isPublished: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            order: 0,
            type: "RATING",
            label: "How satisfied are you with your overall work experience?",
            required: true,
          },
          {
            order: 1,
            type: "MULTIPLE_CHOICE",
            label: "What department are you in?",
            required: true,
            options: ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance"],
          },
          {
            order: 2,
            type: "CHECKBOX",
            label: "Which benefits do you value most?",
            required: false,
            options: ["Health Insurance", "Remote Work", "Learning Budget", "Gym Membership", "Flexible Hours"],
          },
          {
            order: 3,
            type: "MULTIPLE_CHOICE",
            label: "Would you recommend this company to a friend?",
            required: true,
            options: ["Yes, definitely", "Maybe", "No"],
          },
          {
            order: 4,
            type: "TEXT",
            label: "What one change would most improve your work experience?",
            required: false,
            conditions: [
              {
                dependsOnId: "__PLACEHOLDER__", // Will be updated after creation
                operator: "not_equals",
                value: "Yes, definitely",
              },
            ],
          },
          {
            order: 5,
            type: "TEXT",
            label: "Any additional comments or suggestions?",
            required: false,
          },
        ],
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  // Fix the conditional logic to point to the correct question ID
  const q3 = survey.questions.find((q) => q.order === 3);
  const q4 = survey.questions.find((q) => q.order === 4);
  if (q3 && q4) {
    await prisma.question.update({
      where: { id: q4.id },
      data: {
        conditions: [{ dependsOnId: q3.id, operator: "not_equals", value: "Yes, definitely" }],
      },
    });
  }

  console.log(`✅ Sample survey: "${survey.title}" (slug: ${survey.slug})`);
  console.log(`   → Public URL: /s/${survey.slug}`);

  // Add some sample responses
  const questions = survey.questions.sort((a, b) => a.order - b.order);
  const sampleAnswers = [
    { [questions[0].id]: 4, [questions[1].id]: "Engineering", [questions[2].id]: ["Remote Work", "Learning Budget"], [questions[3].id]: "Yes, definitely" },
    { [questions[0].id]: 3, [questions[1].id]: "Design", [questions[2].id]: ["Health Insurance"], [questions[3].id]: "Maybe", [questions[4]?.id ?? ""]: "Better tooling would help" },
    { [questions[0].id]: 5, [questions[1].id]: "Marketing", [questions[2].id]: ["Flexible Hours", "Remote Work"], [questions[3].id]: "Yes, definitely" },
    { [questions[0].id]: 2, [questions[1].id]: "Sales", [questions[2].id]: ["Gym Membership"], [questions[3].id]: "No", [questions[4]?.id ?? ""]: "More work-life balance needed" },
    { [questions[0].id]: 4, [questions[1].id]: "HR", [questions[2].id]: ["Health Insurance", "Learning Budget"], [questions[3].id]: "Yes, definitely" },
  ];

  for (const answers of sampleAnswers) {
    await prisma.response.create({
      data: {
        surveyId: survey.id,
        answers,
        partial: false,
      },
    });
  }

  console.log(`✅ Created ${sampleAnswers.length} sample responses`);
  console.log("\n🎉 Seed complete! You can now run: npm run dev");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
