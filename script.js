// Socket 状态
const SocketState = {
    Unconnected: 0,
    HostLookup: 1,
    Connecting: 2,
    Connected: 3,
    Bound: 4,
    Listening: 5,
    Closing: 6,
}

// 职业
const CharacterClassType = {
    StrDexInt: 0,
    Str: 1,
    Dex: 2,
    Int: 3,
    StrDex: 4,
    StrInt: 5,
    DexInt: 6,
}

// 仓库类型
const Inventories = {
}

function Tick() {
    if (Client.SocketState == SocketState.Unconnected && Game.SocketState == SocketState.Unconnected) {
        Client.connectToHost("dal01.login.pathofexile.com", 20481);
    }

    if (Game.SocketState == SocketState.Connected && Game.PlayerId != 0) {

        // 獅眼守望
        if (Game.WorldAreaId == "1_1_town") {
            // 喊话
            if (Game.ChatChannel != 0) {
                console.log("Game.ChatChannel:" + Game.ChatChannel);

                Game.SendChat("# hello");

                // switch (Math.floor(Math.random() * 3)) {
                //     case 0:
                //         Game.SendChat("# 1. p.2.p");
                //         break;
                //     case 1:
                //         Game.SendChat("# 2. ah");
                //         break;
                //     case 2:
                //         Game.SendChat("# 3. com");
                //         break;
                // }

                Game.Resurrect();
                return;
            }
        }

        // 絕望岩灘
        if (Game.WorldAreaId == "1_1_1") {

            var Player = Game.FindEntity(Game.PlayerId);

            // 自动复活
            if (Player.Components["Life"].Life == 0) {
                console.log("复活");
                Game.Resurrect();
                return;
            }

            // 遍历对象
            for (let i = 0; i < Game.EntityList.length; i++) {
                const Entity = Game.EntityList[i];

                // 自动捡物品
                if (Entity.objectName == "Metadata/MiscellaneousObjects/WorldItem" && Entity.size(Player.Pos) < 100) {
                    Game.Click(Entity.Id);
                    return;
                }

                // 自动打开宝石箱子
                if (Entity.objectName == "Metadata/Chests/TutorialSupportGemChest" && Entity.size(Player.Pos) < 100) {
                    // 点击没打开过的箱子
                    if (Entity.Components["Chest"].v1 == 0) {
                        Game.Click(Entity.Id);
                        return;
                    }
                }

                // 点击大门
                if ((Entity.objectName == "Metadata/QuestObjects/SouthBeachTownEntrance") && Entity.size(Player.Pos) < 70) {
                    Game.Click(Entity.Id);
                    return;
                }

                // Metadata/Monsters/Zombies/BiteZombieSpawner
                if (Entity.objectName == "Metadata/Monsters/Zombies/BiteZombieSpawner") {
                    Game.ClickByObjectName("Metadata/NPC/Act1/WoundedExile");
                    return;
                }

                // 攻击
                if ((Entity.objectName == "Metadata/Monsters/Zombies/ZombieBite@1" ||
                    Entity.objectName == "Metadata/Monsters/ZombieBoss/ZombieBossHillockNormal@1") &&
                    Entity.Components["Life"].Life > 0) {

                    if (Entity.size(Player.Pos) < 100) {
                        var skill = SelectSkill();
                        console.log("Attack" + " " + skill.DisplayedName + " " + Entity.objectName);
                        Game.Attack(Entity.Id, skill.id);
                    }
                    else {
                        Game.MoveTo(Entity.Pos.x, Entity.Pos.y);
                    }

                    return;
                }

                // 跳过教程
                if (Entity.objectName == "Metadata/Terrain/Act1/Area1/Objects/Tutorial_Blocker_3" && Entity.size(Player.Pos) < 50) {
                    Game.SendSkipAllTutorials();
                }
            }

            // 遍历物品
            for (let i = 0; i < Game.ItemList.length; i++) {
                const Item = Game.ItemList[i];

                // 自动戴宝石
                if (Item.InventoryName == "Weapon1") {

                    for (let j = 0; j < Item.Components["Sockets"].length; j++) {
                        const Socket = Item.Components["Sockets"][j];

                        // 判断孔上有没有宝石
                        if (Socket.isItem == false) {

                            for (let k = 0; k < Game.ItemList.length; k++) {
                                const Gem = Game.ItemList[k];

                                if (j == 0) {
                                    // 主动技能
                                    if (Gem.BaseItemType.InheritsFrom == "Metadata/Items/Gems/ActiveSkillGem") {
                                        if (Gem.InventoryName == "MainInventory1") {
                                            console.log("从仓库拿起宝石");
                                            Game.SendUpItem(1, Gem.Id);
                                        } else if (Gem.InventoryName == "Cursor1") {
                                            console.log("带上宝石");
                                            Game.SendUseGem(3, Item.Id, j);
                                        }
                                    }
                                } else if (j == 1) {
                                    // 辅助技能
                                    if (Gem.BaseItemType.InheritsFrom == "Metadata/Items/Gems/SupportSkillGem") {
                                        if (Gem.InventoryName == "MainInventory1") {
                                            console.log("从仓库拿起宝石");
                                            Game.SendUpItem(1, Gem.Id);
                                        } else if (Gem.InventoryName == "Cursor1") {
                                            console.log("带上宝石");
                                            Game.SendUseGem(3, Item.Id, j);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            var pos = Game.RadarInfo["Lioneye's Watch"];
            var size = Player.size(Qt.point(pos.x, pos.y));

            if (size > 100) {
                Game.MoveTo(pos.x, pos.y);
            }

        }
    }
}

function SelectSkill() {
    var Actor = Game.FindEntity(Game.PlayerId).Components["Actor"];

    if (Actor.ActiveSkills.length == 1) {
        return Actor.ActiveSkills[0];
    } else if (Actor.ActiveSkills.length == 2) {
        return Actor.ActiveSkills[1];
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
        Client.SendCreateCharacter(randomString(8), "Sentinel", CharacterClassType.Int);
    }
}

// 生成随机字符串
function randomString(len = 8) {
    var result = '';
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}