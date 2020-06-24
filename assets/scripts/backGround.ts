import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import {mangeGame} from "./mange/mangeGame";
const { ccclass, property } = _decorator;

@ccclass('backGround')
export class backGround extends mangeGame {
    start () {
        // Your initialization goes here.
        cc.log("start backGround");
    }

    //给一个向前的方向
    private initDirection() {

    }

    //初始化坐标
    public initPosition() {

    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
