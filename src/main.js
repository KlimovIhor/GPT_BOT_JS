const { HtmlTelegramBot, userInfoToString } = require("./bot");
const ChatGptService = require("./gpt");

class MyTelegramBot extends HtmlTelegramBot {
    constructor(token) {
        super(token);
        this.mod = null;
        this.list = [];
        this.user = {};  // Инициализация user в конструкторе
        this.count = 0;  // Инициализация count в конструкторе
    }

    async start(msg) {
        this.mod = "main";
        this.list = [];  // Очищаем список при запуске нового сценария
        const text = this.loadMessage("main");
        await this.sendImage("main");
        await this.sendText(text);

        await this.showMainMenu({
            "start": "главное меню бота",
            "profile": "генерация Tinder-профиля 😎",
            "opener": "сообщение для знакомства 🥰",
            "message": "переписка от вашего имени 😈",
            "date": "переписка со звездами 🔥",
            "gpt": "задать вопрос чату GPT 🧠",
            "html": "Демонстрация HTML"
        });
    }

    async html(msg) {
        await this.sendHTML('<h3 style="color: hotpink">Hello World!</h3>');
        const html = this.loadHtml("main");
        await this.sendHTML(html, { theme: "dark" });
    }

    async gpt(msg) {
        this.mod = "gpt";
        this.list = [];  // Очищаем список при переходе в режим GPT
        const text = this.loadMessage("gpt");
        await this.sendImage("gpt");
        await this.sendText(text);
    }

    async gptDialog(msg) {
        const text = msg.text;
        const myMessage = await this.sendText("Ваше сообщение переслано чату GPT, ожидайте...");
        const answer = await chatgpt.sendQuestion("Ответь на вопрос", text);
        await this.editText(myMessage, answer);
    }

    async date(msg) {
        this.mod = "date";
        this.list = [];
        const text = this.loadMessage("date");
        await this.sendImage("date");
        await this.sendTextButtons(text, {
            "date_grande": "Ариана Гранде",
            "date_robbie": "Марго Робби",
            "date_zendaya": "Зендея",
            "date_gosling": "Райан Гослинг",
            "date_hardy": "Том Харди",
        });
    }

    async dateButton(callbackQuery) {
        const query = callbackQuery.data;
        await this.sendImage(query);
        await this.sendText("Отличный выбор");
        const prompt = this.loadPrompt(query);
        chatgpt.setPrompt(prompt);
    }

    async dateDialog(msg) {
        const text = msg.text;
        const myMessage = await this.sendText("Набирает сообщение...");
        const answer = await chatgpt.addMessage(text);
        await this.editText(myMessage, answer);
    }

    async message(msg) {
        this.mod = "message";
        this.list = [];  // Очищаем список при начале нового сценария переписки
        const text = this.loadMessage("message");
        await this.sendImage("message");
        await this.sendTextButtons(text, {
            "message_next": "Следующее сообщение",
            "message_date": "Пригласить на свидание",
        });
    }

    async messageButton(callbackQuery) {
        const query = callbackQuery.data;
        const prompt = this.loadPrompt(query);
        const userChatHistory = this.list.join("\n\n");

        const myMessage = await this.sendText("Чат GPT думает над вариантами ответа...");
        const answer = await chatgpt.sendQuestion(prompt, userChatHistory);
        await this.editText(myMessage, answer);
    }

    async messageDialog(msg) {
        const text = msg.text;
        this.list.push(text);
    }

    async profile(msg) {
        this.mod = "profile";
        const text = this.loadMessage("profile");
        await this.sendImage("profile");
        await this.sendText(text);
        this.user = {};
        this.count = 0;

        await this.sendText("Сколько вам лет?");
    }

    async profileDialog(msg) {
        const text = msg.text;
        this.count++;

        if (this.count === 1) {
            this.user["age"] = text;
            await this.sendTextButtons("Кем вы работаете?", {});
        } else if (this.count === 2) {
            this.user["occupation"] = text;
            await this.sendTextButtons("У вас есть хобби?", {});
        } else if (this.count === 3) {
            this.user["hobby"] = text;
            await this.sendTextButtons("Что вам не нравится в людях?", {});
        } else if (this.count === 4) {
            this.user["annoys"] = text;
            await this.sendTextButtons("Какие цели вашего знакомства?", {});
        } else if (this.count === 5) {
            this.user["goals"] = text;


        }
    }

    async opener(msg) {
        this.mod = "opener";
        const text = this.loadMessage("opener");
        await this.sendImage("opener");
        await this.sendText(text);
        this.user = {}
            this.count = 0;
            await this.sendText("Имя девушки ?")

    }

    async openerDialog(msg) {

        const text = msg.text;
        this.count++;

        if (this.count === 1) {
            this.user["name"] = text;
            await this.sendTextButtons("Сколько ей лет?", {});
        }
        if (this.count === 2) {
            this.user["age"] = text;
            await this.sendTextButtons("Оцените её внешность : 1-10 балов", {});
        }
        if (this.count === 3) {
            this.user["occupation"] = text;
            await this.sendTextButtons("Кем она работает?", {});
        }
        if (this.count === 4) {
            this.user["goals"] = text;
            const prompt = this.loadPrompt("profile");
            const info = userInfoToString(this.user);

            const myMessage = await this.sendText("Чат GPT занимается генерацией вашего оупенара...");
            const answer = await chatgpt.sendQuestion(prompt, info);
            await this.editText(myMessage, answer);
        }

    }

    async hello(msg) {
        if (this.mod === "gpt")
            await this.gptDialog(msg);
        else if (this.mod === "date")
            await this.dateDialog(msg);
        else if (this.mod === "message")
            await this.messageDialog(msg);
        else if (this.mod === "profile")
            await this.profileDialog(msg);
        else if (this.mod === "opener")
            await this.openerDialog(msg);
        else {
            const text = msg.text;

            await this.sendText("<b>Hello!</b>");
            await this.sendText("<i>How are you?</i>");
            await this.sendText(`Вы написали: ${text}`);
            await this.sendImage("avatar_main");

            await this.sendTextButtons("What is your Telegram theme?", {
                "theme_light": "Light",
                "theme_dark": "Dark",
            });
        }
    }

    async helloButton(callbackQuery) {
        const query = callbackQuery.data;
        if (query === "theme_light")
            await this.sendText("У вас светлая тема");
        else if (query === "theme_dark")
            await this.sendText("У вас темная тема");
    }
}

const chatgpt = new ChatGptService("gpt:fXtFfefcMJW5gbKvJxHPJFkblB3TaymEaIPsJ1W67t7kdwMM");
const bot = new MyTelegramBot("6590689196:AAEp9CRMlH8JaBaZ8QnHNktpalTKLOAps2Q");

bot.onCommand(/\/start/, bot.start.bind(bot));
bot.onCommand(/\/html/, bot.html.bind(bot));
bot.onCommand(/\/gpt/, bot.gpt.bind(bot));
bot.onCommand(/\/date/, bot.date.bind(bot));
bot.onCommand(/\/message/, bot.message.bind(bot));
bot.onCommand(/\/profile/, bot.profile.bind(bot));
bot.onCommand(/\/opener/, bot.opener.bind(bot));
bot.onTextMessage(bot.hello.bind(bot));
bot.onButtonCallback(/^date_.*/, bot.dateButton.bind(bot));
bot.onButtonCallback(/^message_.*/, bot.messageButton.bind(bot));
bot.onButtonCallback(/^.*/, bot.helloButton.bind(bot));