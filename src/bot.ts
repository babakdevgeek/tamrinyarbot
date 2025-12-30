import { Markup, Telegraf } from "telegraf";
import { homeMenu } from "./keyboards/home.keyboard.js";
import prisma from "./db.js";
import { steps } from "./constants/steps.js";
import { addExcerciseMenu } from "./keyboards/Cancel.js";
import { getExercisesKeyboard } from "./keyboards/allExcercises.js";
import { buttonsText } from "./constants/buttonsText.js";
import { persianToEnglishNumber } from "./lib/persianNumConvertors.js";
import { getSelectedExercise } from "./lib/getSelectedExcercise.js";

export const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  ctx.reply(
    `
سلام ${ctx.from.first_name}!

💪 ربات تمرینی هوشمند | Track & Rank

یک دستیار کامل برای ورزشکاران و بدنسازان حرفه‌ای که همه جزئیات تمرینات شما را مدیریت و تحلیل می‌کند. این ربات امکان ثبت، به‌روزرسانی و دنبال‌کردن وزنه‌ها، حرکات، ست‌ها و تکرارها را به‌صورت دقیق فراهم می‌کند و تنها آخرین رکورد هر حرکت را برای پیگیری پیشرفت شما نگه می‌دارد.

ویژگی‌ها:
- 🏋️‍♂️ پیگیری وزنه‌ها و حرکات: ثبت تمام حرکات، ست‌ها، تکرارها و وزنه‌های شما با دقت کامل.
- 🥇 رنکینگ حرفه‌ای: مشاهده جدول رنک کاربران بر اساس سنگین‌ترین وزنه‌های زده شده، همراه با نام و یوزرنیم (در صورت موجود بودن).
- 📈 مدیریت پیشرفت: تمرینات شما همیشه به‌روز و قابل بررسی هستند تا پیشرفتتان به‌وضوح مشخص باشد.

این ربات ابزار ایده‌آل برای کسانی است که می‌خواهند تمرینات خود را حرفه‌ای دنبال کنند، با دیگران رقابت سالم داشته باشند و انگیزه برای رسیدن به اهداف ورزشی خود را همیشه حفظ کنند.
`,
    homeMenu
  );
});

bot.hears(buttonsText.home.addExercise, async (ctx) => {
  await prisma.user.upsert({
    where: { telegramId: BigInt(ctx.from.id) },
    update: { currentStep: steps.wait_name },
    create: {
      telegramId: BigInt(ctx.from.id),
      currentStep: steps.wait_name,
      username: ctx.from.username || null,
      firstname: ctx.from.first_name,
    },
  });
  await ctx.reply("اسم حرکت را وارد کن 🏋️", addExcerciseMenu);
});

bot.hears(buttonsText.home.rank, async (ctx) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstname: true,
      username: true,
      exercises: {
        select: {
          weight: true,
        },
      },
    },
  });
  const ranking = users
    .map((user) => {
      const maxWeight = Math.max(...user.exercises.map((ex) => ex.weight), 0);

      return {
        name: user.firstname || user.username || "بدون‌نام",
        maxWeight,
      };
    })
    .filter((u) => u.maxWeight > 0)
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .slice(0, 10); // مثلا 10 نفر اول
  const lines = ranking.map((user, index) => {
    const medal =
      index === 0
        ? "🥇"
        : index === 1
        ? "🥈"
        : index === 2
        ? "🥉"
        : `${index + 1}.`;

    return `${medal} ${user.name}   ←  ${user.maxWeight} kg`;
  });

  const message = `🏆 رنک کاربران

${lines.join("\n")}`;
  await ctx.reply(message);
});

bot.hears(buttonsText.home.report, async (ctx) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(ctx.from.id) },
    include: { exercises: true },
  });
  if (!user || user.exercises.length === 0) {
    await ctx.reply("هنوز حرکتی ثبت نکرده‌ای 💤", homeMenu);
    return;
  }
  const totalExercises = user.exercises.length;
  const maxWeightExercise = user.exercises.reduce(
    (maxEx, currentEx) =>
      currentEx.weight > (maxEx?.weight ?? 0) ? currentEx : maxEx,
    null as (typeof user.exercises)[0] | null
  );
  let report = `📊 *گزارش تمرینات شما*\n\n`;
  report += `🏋️‍♂️ تعداد حرکات   ←  ${totalExercises}\n`;
  report += `⚖️ سنگین‌ترین وزنه ←  ${maxWeightExercise?.weight ?? "-"} kg\n`;
  report += `🏷 حرکت           ←  ${maxWeightExercise?.name ?? "-"}`;
  await ctx.reply(report, { parse_mode: "Markdown" });
});

bot.hears(buttonsText.home.allExsInOneMessage, async (ctx) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(ctx.from.id) },
    include: { exercises: true },
  });

  if (!user || user.exercises.length === 0) {
    await ctx.reply("هنوز حرکتی ثبت نکرده‌ای 💤", homeMenu);
    return;
  }

  // ساخت متن خوانا

  let text = `📋 *لیست حرکات شما*\n\n`;
  user.exercises.forEach((ex, index) => {
    text += `🏋️ ${ex.name} | ست: ${ex.sets} | وزنه: ${ex.weight}kg\n`;

    text += "\n\n";
  });
  text += "\n";

  await ctx.replyWithPhoto(
    "https://www.primalstrength.com/cdn/shop/files/gymdesign_render_Two_collumn_grid_cb1b5850-fa8e-4a7b-a2b3-190c2e45facd.jpg?v=1680719688&width=500",
    {
      caption: text,
      parse_mode: "Markdown",
    }
  );
});

bot.hears(buttonsText.excerciseDetails.delete, async (ctx) => {
  const telegramId = BigInt(ctx.from.id);
  const user = await prisma.user.findUnique({
    where: { telegramId },
  });
  if (!user || !user.selectedExerciseId) return;
  await prisma.exercise.delete({
    where: { id: user.selectedExerciseId },
  });
  await prisma.user.update({
    where: { telegramId },
    data: { selectedExerciseId: null, currentStep: null },
  });
  await ctx.reply("حرکت با موفقیت حذف شد ✅", homeMenu);
});

bot.hears(buttonsText.excerciseDetails.update, async (ctx) => {
  const telegramId = BigInt(ctx.from.id);
  const user = await prisma.user.findUnique({
    where: { telegramId },
  });
  if (!user || !user.selectedExerciseId) return;
  await prisma.user.update({
    where: { telegramId },
    data: { currentStep: steps.wait_name },
  });
  await ctx.reply("اسم حرکت را وارد کن 🏋️", addExcerciseMenu);
});

bot.hears(buttonsText.home.myExercises, async (ctx) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(ctx.from.id) },
  });
  if (!user) return;

  const keyboard = await getExercisesKeyboard(user.id);
  if (!keyboard) {
    await ctx.reply("هنوز حرکتی ثبت نکرده‌اید.", homeMenu);
    return;
  }

  await ctx.reply("حرکات شما:", keyboard);
});
bot.hears(buttonsText.excerciseDetails.back, async (ctx) => {
  const telegramId = BigInt(ctx.from.id);
  const user = await prisma.user.findUnique({
    where: { telegramId },
  });
  if (!user) return;
  if (user.currentStep === steps.in_excercise_details) {
    const keyboard = await getExercisesKeyboard(user.id);
    if (!keyboard) {
      await ctx.reply("هنوز حرکتی ثبت نکرده‌اید.", homeMenu);
      return;
    }
    await prisma.user.update({
      where: { telegramId },
      data: { selectedExerciseId: null, currentStep: null },
    });
    await ctx.reply("حرکات شما:", keyboard);
  } else {
    await prisma.user.update({
      where: { telegramId },
      data: { selectedExerciseId: null, currentStep: null },
    });
    await ctx.reply("بازگشت به منوی اصلی", homeMenu);
  }
});

// it should be last hears
bot.hears(/.+/, async (ctx) => {
  const telegramId = BigInt(ctx.from.id);
  const text = ctx.message.text;
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(ctx.from.id) },
    include: { exercises: true }, // ✅ این خط باعث می‌شود exercises موجود باشد
  });
  if (!user) return;

  // مراحل اضافه کردن حرکت جدید
  if (user.currentStep === steps.wait_name) {
    await prisma.user.update({
      where: { telegramId },
      data: { tempExerciseName: text, currentStep: steps.wait_sets },
    });
    await ctx.reply("تعداد ست ها را وارد کنید 🔢", addExcerciseMenu);
    return;
  }

  if (user.currentStep === steps.wait_sets) {
    const sets = parseInt(persianToEnglishNumber(text));
    if (isNaN(sets)) {
      await ctx.reply("لطفا یک عدد معتبر وارد کنید 🔢");
      return;
    }
    await prisma.user.update({
      where: { telegramId },
      data: { tempSets: sets, currentStep: steps.wait_reps },
    });
    await ctx.reply("تعداد تکرارها را وارد کنید 🔢", addExcerciseMenu);
    return;
  }

  if (user.currentStep === steps.wait_reps) {
    const reps = text; // دریافت به صورت رشته
    await prisma.user.update({
      where: { telegramId },
      data: { tempReps: reps, currentStep: steps.wait_weight },
    });
    await ctx.reply("وزنه را وارد کنید (کیلوگرم) 🔢", addExcerciseMenu);
    return;
  }

  if (user.currentStep === steps.wait_weight) {
    const weight = parseInt(persianToEnglishNumber(text));
    if (isNaN(weight)) {
      await ctx.reply("لطفا یک عدد معتبر وارد کنید 🔢");
      return;
    }
    const selectedExercise = await getSelectedExercise(telegramId);
    if (selectedExercise && user.currentStep === steps.wait_weight) {
      const exercise = await prisma.exercise.update({
        where: { id: selectedExercise.id },
        data: {
          name: user.tempExerciseName!,
          sets: user.tempSets!,
          reps: user.tempReps!,
          weight,
        },
      });
      await prisma.user.update({
        where: { telegramId },
        data: {
          currentStep: null,
          selectedExerciseId: null,
          tempExerciseName: null,
          tempSets: null,
          tempReps: null,
          tempWeight: null,
        },
      });

      await ctx.reply(
        `حرکت "${exercise.name}" با ${exercise.sets} ست به‌روزرسانی شد ✅`,
        homeMenu
      );
    } else {
      const exercise = await prisma.exercise.create({
        data: {
          name: user.tempExerciseName!,
          userId: user.id,
          sets: user.tempSets!,
          reps: user.tempReps!,
          weight,
        },
      });
      await prisma.user.update({
        where: { telegramId },
        data: {
          currentStep: null,
          tempExerciseName: null,
          tempSets: null,
          tempReps: null,
          tempWeight: null,
        },
      });

      await ctx.reply(
        `حرکت "${exercise.name}" با ${exercise.sets} ست ثبت شد ✅`,
        homeMenu
      );
    }
  }

  // مدیریت انتخاب حرکت از صفحه حرکات من

  const exercise = user.exercises.find((ex) => ex.name === text);
  if (!exercise) return;

  await prisma.user.update({
    where: { telegramId },
    data: {
      selectedExerciseId: exercise.id,
      currentStep: steps.in_excercise_details,
    },
  });

  const details = `🏋️‍♂️ ${exercise.name}

ست‌ها   ←  ${exercise.sets}
تکرار  ←  ${exercise.reps}
وزنه   ←  kg ${exercise.weight}`;

  // نمایش جزئیات حرکت با گزینه‌های به‌روزرسانی و حذف
  await ctx.reply(
    details,
    Markup.keyboard([
      [
        buttonsText.excerciseDetails.update,
        buttonsText.excerciseDetails.delete,
      ],
      [buttonsText.excerciseDetails.back],
    ]).resize()
  );
});
