import {
    _decorator,
    Component,
    Node,
    RigidBodyComponent,
    Vec3,
    tweenUtil,
    BoxColliderComponent,
    ICollisionEvent,
    Quat,
    SkeletalAnimationComponent,
    logID,
    log
} from 'cc';
import { mangeGame } from "./mange/mangeGame";

const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends mangeGame {

    private speed: number = 5;
    private _curPos: Vec3 = cc.v3();

    update(deltaTime: number) {
        // Your update function goes here.
        this.node.position = this._curPos;
    }

    start() {
        log("start player");
        let collider = this.getComponent(BoxColliderComponent);
        if (collider) {
            log('collider');
            collider.on('onCollisionEnter', this.onCollision, this);
            collider.on('onCollisionStay', this.onCollision, this);
            collider.on('onCollisionExit', this.onCollision, this);
        }

        this.resetPos();
    }

    onCollision(event: ICollisionEvent) {
        const collider = this.getComponent(BoxColliderComponent);
        if (collider != event.selfCollider) {
            return;
        }
        if (event.type == 'onCollisionStay') {
            log('onCollisionStay');
        } else if (event.type == 'onCollisionExit') {
            log('onCollisionExit');
        } else if (event.type == 'onCollisionEnter') {
            log('onCollisionEnter');
        }
    }

    resetPos() {
        this._curPos.x = this._curPos.y = this._curPos.z = 0;
    }

    public startAnimationRun() {

        if (!this.getComponent(SkeletalAnimationComponent).getState("Take 001").isPlaying || this.getComponent(SkeletalAnimationComponent).getState("Take 001").isPaused) {
            this.getComponent(SkeletalAnimationComponent).play();
        }
    }

    public pauseAnimationRun() {
        this.getComponent(SkeletalAnimationComponent).pause();
    }

    /**
     * 向前
     * */
    public up(delta) {
        this.node.setRotationFromEuler(0, 180, 0);

        this.setCurZ(delta);
    }

    /**
     * 向后
     * */
    public down(delta) {
        this.node.setRotationFromEuler(0, 0, 0);

        this.setCurZ(delta);
    }

    /**
     * 向左
     * */
    public left(delta) {
        this.node.setRotationFromEuler(0, 270, 0);

        this.setCurX(delta);
    }

    /**
     * 向右
     * */
    public right(delta) {
        this.node.setRotationFromEuler(0, 90, 0);

        this.setCurX(delta);
    }


    /**
     * 向前右
     * */
    public up_right(delta) {
        this.node.setRotationFromEuler(0, 135, 0);
        this.setCurX(delta);
        this.setCurZ(delta);
    }

    /**
     * 向前左
     * */
    public up_left(delta) {
        this.node.setRotationFromEuler(0, 225, 0);
        this.setCurX(delta);
        this.setCurZ(delta);
    }

    /**
     * 向下左
     * */
    public down_left(delta) {
        this.node.setRotationFromEuler(0, 315, 0);
        this.setCurX(delta);
        this.setCurZ(delta);
    }

    /**
     * 向下右
     * */
    public down_right(delta) {
        this.node.setRotationFromEuler(0, 45, 0);
        this.setCurX(delta);
        this.setCurZ(delta);
    }

    /**
     * 设置方向
     * */
    public allDir(angle, delta) {
        this.node.setRotationFromEuler(0, angle, 0);
        this.setCurX(delta);
        this.setCurZ(delta);
    }

    /**
     * 设置上下
     * */
    private setCurZ(delta) {
        let targetZ = this._curPos.z - delta.z * this.speed * 1e-2;
        if (targetZ > 50) targetZ = 50;
        if (targetZ < -50) targetZ = -50;
        this._curPos.z = targetZ;
    }

    /**
     * 设置左右
     * */
    private setCurX(delta) {
        let targetX = this._curPos.x - delta.x * this.speed * 1e-2;
        if (targetX > 50) targetX = 50;
        if (targetX < -50) targetX = -50;
        this._curPos.x = targetX;
    }


    // 根据自身方向，转化方向
    public _getDirection(x: number, y: number, z: number) {
        const result = new Vec3(x, y, z);
        Vec3.transformQuat(result, result, this.node.getRotation());
        return result;
    }
}
