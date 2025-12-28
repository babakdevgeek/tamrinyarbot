import { Markup, Telegraf } from "telegraf";
import { homeMenu } from "./keyboards/home.keyboard.js";
import prisma from "./db.js";
import { steps } from "./constants/steps.js";
import { addExcerciseMenu } from "./keyboards/Cancel.js";
import { getExercisesKeyboard } from "./keyboards/allExcercises.js";
import { buttonsText } from "./constants/buttonsText.js";

export const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  ctx.reply(
    `
        سلام ${ctx.from.first_name}
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

// it should be last hears
bot.hears(/.+/, async (ctx) => {
  const telegramId = BigInt(ctx.from.id);
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(ctx.from.id) },
    include: { exercises: true }, // ✅ این خط باعث می‌شود exercises موجود باشد
  });
  if (!user) return;

  const text = ctx.message.text.trim();

  // cancel or return

  if (
    text === buttonsText.addExerciseMenu.back ||
    text === buttonsText.addExerciseMenu.cancel
  ) {
    await prisma.user.update({
      where: { telegramId },
      data: {
        currentStep: null,
        tempExerciseName: null,
        tempSets: null,
        tempReps: null,
      },
    });
    await ctx.reply("عملیات کنسل شد ❌", homeMenu);
    return;
  }

  if (user.currentStep === steps.wait_name) {
    await prisma.user.update({
      where: { telegramId },
      data: { tempExerciseName: text, currentStep: steps.wait_sets },
    });
    await ctx.reply("تعداد ست ها را وارد کنید 🔢", addExcerciseMenu);
    return;
  }

  if (user.currentStep === steps.wait_sets) {
    const sets = parseInt(text);
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
    const weight = parseFloat(text);
    if (isNaN(weight)) {
      await ctx.reply("لطفا یک عدد معتبر وارد کنید 🔢");
      return;
    }
    const exercise = await prisma.exercise.create({
      data: {
        name: user.tempExerciseName!,
        userId: user.id,
        sets: user.tempSets!,
        reps: user.tempReps!,
        weight: weight,
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

  const exercise = user.exercises.find((ex) => ex.name === text);
  if (!exercise) return;

  const details = `🏋️‍♂️ ${exercise.name}\nست: ${exercise.sets}\nتکرار: ${exercise.reps}\nوزنه: ${exercise.weight} کیلو`;

  // نمایش جزئیات + دکمه بازگشت
  await ctx.reply(details, Markup.keyboard([["⬅️ بازگشت"]]).resize());
});
