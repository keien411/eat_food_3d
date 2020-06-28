import { _decorator, Component, Node, RigidBodyComponent, Vec3 ,tweenUtil, BoxColliderComponent, ICollisionEvent, Quat} from 'cc';
import {mangeGame} from "./mange/mangeGame";
const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends mangeGame {

    private speed :number = 1;
    private time :number = 0;
    private _curPos: Vec3 = cc.v3();

    update (deltaTime: number) {
        // Your update function goes here.
        this.node.position = this._curPos;
    }

    start () {
        cc.log("start player");
        let collider = this.getComponent(BoxColliderComponent);
        if (collider) {
            cc.log('collider');
            collider.on('onCollisionEnter', this.onCollision, this);
            collider.on('onCollisionStay', this.onCollision, this);
            collider.on('onCollisionExit', this.onCollision, this);
        }

        this.resetPos();
    }

    onCollision (event: ICollisionEvent) {
        cc.log('onCollision');
        const collider = this.getComponent(BoxColliderComponent);
        if (collider != event.selfCollider) {
            return;
        }
        if (event.type == 'onCollisionStay') {
            cc.log('onCollisionStay');
        } else if (event.type == 'onCollisionExit') {
            cc.log('onCollisionExit');
        }
    }

    resetPos() {
        this._curPos.x = this._curPos.y = this._curPos.z = 0;
    }

    /*
    * 向前
    * */
    public up(delta) {
        this.node.setRotationFromEuler(0,180,0);

        let targetZ = this._curPos.z - delta.z * 1e-2;
        if (targetZ > 50) targetZ = 50;
        if (targetZ < - 50) targetZ = -50;
        this._curPos.z = targetZ;
    }

    /*
   * 向后
   * */
    public down(delta) {
        this.node.setRotationFromEuler(0,0,0);

        let targetZ = this._curPos.z - delta.z * 1e-2;
        if (targetZ > 50) targetZ = 50;
        if (targetZ < - 50) targetZ = -50;
        this._curPos.z = targetZ;
    }

    /*
    * 向左
    * */
    public left(delta) {
        this.node.setRotationFromEuler(0,90,0);

        let targetX = this._curPos.x - delta.x * 1e-2;
        if (targetX > 50) targetX = 50;
        if (targetX < - 50) targetX = -50;
        this._curPos.x = targetX;
    }

    /*
   * 向右
   * */
    public right(delta) {
        this.node.setRotationFromEuler(0,-90,0);

        let targetX = this._curPos.x - delta.x * 1e-2;
        if (targetX > 50) targetX = 50;
        if (targetX < - 50) targetX = -50;
        this._curPos.x = targetX;
    }



    // 根据自身方向，转化方向
    public _getDirection (x: number, y: number, z: number) {
        const result = new Vec3(x, y, z);
        Vec3.transformQuat(result, result, this.node.getRotation());
        return result;
    }
}
