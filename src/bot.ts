import { Telegraf } from "telegraf";
import { homeMenu } from "./keyboards/home.keyboard.js";
import prisma from "./db.js";
import { steps } from "./constants/steps.js";
import { addExcerciseMenu } from "./keyboards/Cancel.js";

export const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  ctx.reply(
    `
        سلام ${ctx.from.first_name}
        `,
    homeMenu
  );
});

const homeMenuTexts = homeMenu.reply_markup.keyboard.flat();

bot.hears(homeMenuTexts[0] as string, async (ctx) => {
  await prisma.user.update({
    where: { telegramId: BigInt(ctx.from.id) },
    data: { currentStep: steps.wait_name },
  });
  await ctx.reply("اسم حرکت را وارد کن 🏋️", addExcerciseMenu);
});

bot.hears(/.+/, async (ctx) => {
  const telegramId = BigInt(ctx.from.id);
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) return;

  const text = ctx.message.text.trim();

  // cancel or return
  const addExcerciseMenuTexts = addExcerciseMenu.reply_markup.keyboard.flat();
  if (text === addExcerciseMenuTexts[0] || text === addExcerciseMenuTexts[1]) {
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
});
