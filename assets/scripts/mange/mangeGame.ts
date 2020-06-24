import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('mangeGame')
export class mangeGame extends Component {

    start () {
        // Your initialization goes here.
    }
    //初始化坐标
    public initPosition() {
        cc.log("mangeGame initPosition");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
