const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { code: "first_lap", title: "Первый круг", description: "Первый заезд.", icon: "🏁" },
  { code: "young_pilot", title: "Юный пилот", description: "Пройден базовый курс.", icon: "🟣" },
  { code: "reverse", title: "Reverse", description: "Пройден курс Reverse.", icon: "🔄" },
  { code: "first_record", title: "Первый рекорд", description: "Установлен личный рекорд.", icon: "🔥" },
  { code: "faster", title: "Стал быстрее", description: "Улучшил результат.", icon: "⚡" },
  { code: "stability", title: "Стабильность", description: "Серия стабильных кругов.", icon: "🎯" },
  { code: "pro_pilot", title: "PRO PILOT", description: "Пройден PRO-уровень.", icon: "🏆" },
  { code: "race_ready", title: "Готов к гонке", description: "Пройдена подготовка к соревнованиям.", icon: "🏎️" },
];

async function main() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: a,
      create: a,
    });
  }
  console.log(`Засеяно достижений: ${ACHIEVEMENTS.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
