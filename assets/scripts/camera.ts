import { _decorator, Component, Node, RigidBodyComponent, Vec3 } from 'cc';
import {mangeGame} from "./mange/mangeGame";
const { ccclass, property,type } = _decorator;

@ccclass('camera')
export class camera extends mangeGame {

    @type(Node)
    private player:Node | null = null;


    start () {
        cc.log("start camera");
    }

    update (deltaTime: number) {
        this.node.setWorldPosition(this.player.getWorldPosition().x,this.player.getWorldPosition().y + 4,this.player.getWorldPosition().z + 15);
    }
}
