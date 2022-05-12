
const SocketState = {
    Unconnected: 0,
    HostLookup: 1,
    Connecting: 2,
    Connected: 3,
    Bound: 4,
    Listening: 5,
    Closing: 6,
}

const CharacterClassType = {
    StrDexInt: 0,
    Str: 1,
    Dex: 2,
    Int: 3,
    StrDex: 4,
    StrInt: 5,
    DexInt: 6,
}

function Tick() {
    if (Client.SocketState == SocketState.Unconnected && Game.SocketState == SocketState.Unconnected) {
        Client.connectToHost("sjc01.login.pathofexile.com", 20481);
    }

    if (Game.SocketState == SocketState.Connected && Game.PlayerId != 0) {

        // 絕望岩灘
        if (Game.WorldAreaId == "1_1_1") {

            // 自动复活
            if (Game.FindEntity(Game.PlayerId).Components["Life"].Life == 0) {
                console.log("复活");
                Game.Resurrect();
                return;
            }

            // 点击游戏对象
            for (let i = 0; i < Game.EntityList.length; i++) {
                const Entity = Game.EntityList[i];

                // Metadata/MiscellaneousObjects/WorldItem
                // Metadata/QuestObjects/SouthBeachTownEntrance
                if ((Entity.objectName == "Metadata/QuestObjects/SouthBeachTownEntrance" || Entity.objectName == "Metadata/MiscellaneousObjects/WorldItem")
                    && Entity.size(Game.FindEntity(Game.PlayerId).Pos) < 60) {
                    Game.Click(Entity.Id);
                    return;
                }

                // Metadata/Monsters/Zombies/BiteZombieSpawner
                if (Entity.objectName == "Metadata/Monsters/Zombies/BiteZombieSpawner") {
                    Game.ClickByObjectName("Metadata/NPC/Act1/WoundedExile");
                    return;
                }
            }

            // 攻击
            for (let i = 0; i < Game.EntityList.length; i++) {
                const Entity = Game.EntityList[i];

                // Metadata/Monsters/Zombies/ZombieBite@1
                // Metadata/Monsters/ZombieBoss/ZombieBossHillockNormal@1
                if ((Entity.objectName == "Metadata/Monsters/Zombies/ZombieBite@1" || Entity.objectName == "Metadata/Monsters/ZombieBoss/ZombieBossHillockNormal@1") &&
                    Entity.Components["Life"].Life > 0) {

                    if (Entity.size(Game.FindEntity(Game.PlayerId).Pos) < 50) {
                        console.log("Attack" + " " + JSON.stringify(Entity));
                        Game.Attack(Entity.Id, 0x4000);
                    }
                    else {
                        var pos = Entity.Pos;
                        Game.MoveTo(pos.x, pos.y);
                    }

                    return;
                }
            }

            // 自动跳过教程
            for (let i = 0; i < Game.EntityList.length; i++) {
                const Entity = Game.EntityList[i];
                if (Entity.objectName == "Metadata/Terrain/Act1/Area1/Objects/Tutorial_Blocker_1" && Entity.size(Game.FindEntity(Game.PlayerId).Pos) < 30) {
                    Game.SendSkipAllTutorials();
                    console.log("跳过教程");
                }
            }

            // // 自动戴宝石
            // for (let i = 0; i < Game.ItemList.length; i++) {
            //     const Item = Game.ItemList[i];
            //     // 火球
            //     if (Item.objectName == "Metadata/Items/Gems/SkillGemFireball") {
            //         console.log("带上宝石");
            //     }
            // }

            var pos = Game.RadarInfo["Lioneye's Watch"];
            var player = Game.FindEntity(Game.PlayerId);
            var size = player.size(Qt.point(pos.x, pos.y));
            // console.log(size);

            if (size > 100) {
                Game.MoveTo(pos.x, pos.y);
            }

        }
    }
}

// 响应登录成功事件
function OnClientLoginSuccess() {
    console.log("OnClientLoginSuccess" + " " + JSON.stringify(Client));
}

// 响应收到角色列表事件
function OnClientCharacterList() {
    console.log("OnClientCharacterList");

    var array = Client.CharacterList;

    for (let i = 0; i < array.length; i++) {
        const character = array[i];
        console.log("[" + i + "]" + " " + JSON.stringify(character));
    }

    if (array.length > 0) {
        // 选择角色,进入游戏
        Client.SendSelectCharacter(0);
    }
    else {
        // 创建角色
        Client.SendCreateCharacter(randomString(Math.floor(Math.random() * 8) + 8), "Archnemesis", CharacterClassType.Int);
    }
}

// 生成随机字符串
function randomString(len = 10) {
    var result = '';
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}