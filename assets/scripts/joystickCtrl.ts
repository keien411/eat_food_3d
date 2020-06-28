import { _decorator, Component, Node, RigidBodyComponent, Vec3, SpriteComponent, Color, Vec2 , Mat4, UITransformComponent, Touch} from 'cc';
import {mangeGame} from "./mange/mangeGame";
import { player } from './player';
const { ccclass, property , type} = _decorator;

enum Dir {//0:静止，1：上，2：下，3：左，4：右，5上左，6上右，7下左，8下右
    STILL,
    UP,
    DOWN,
    LEFT,
    RIGHT,
    UPLEFT,
    UPRIGHT,
    DOWNLEFT,
    DOWNRIGHT,
}

@ccclass('joystickCtrl')
export class joystickCtrl extends mangeGame {

    @property(player)
    private playerController: player = null;

    private direction: number = Dir.STILL;

    private speed: number = 6;

    start () {
        this.node.on(Node.EventType.TOUCH_START, this.callbackTOUCH_START, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.callbackTOUCH_MOVE, this);
        this.node.on(Node.EventType.TOUCH_END, this.callbackTOUCH_END, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.callbackTOUCH_CANCEL, this);
    }

    onLoad (){
        cc.log("joystickCtrl onLoad");
        this.initJoyStick();
    }

    private initJoyStick() {

        if (this.node.getChildByName("joystickBg") && this.node.getChildByName("joystickBar")){
            this.node.getChildByName("joystickBg").getComponent(SpriteComponent).color = new Color().fromHEX("#FFFFFF8C");//透明50%
            this.node.getChildByName("joystickBar").getComponent(SpriteComponent).color = new Color().fromHEX("#FFFFFF8C");//透明50%
            this.node.getChildByName("joystickBar").setPosition(this.node.getChildByName("joystickBg").getPosition());
        }

    }

    private callbackTOUCH_START(event) {
        if (this.node.getChildByName("joystickBg") && this.node.getChildByName("joystickBar")){
            this.node.getChildByName("joystickBg").getComponent(SpriteComponent).color = new Color().fromHEX("#FFFFFF");//透明50%
            this.node.getChildByName("joystickBar").getComponent(SpriteComponent).color = new Color().fromHEX("#FFFFFF");//透明50%

            let UITC: UITransformComponent = this.node.getComponent(UITransformComponent);
            if (UITC) {
                let localPosition: Vec3 = new Vec3();
                let touch: Touch = event.touch;
                UITC.convertToNodeSpaceAR(new Vec3(touch.getUILocation().x, touch.getUILocation().y, 0), localPosition);
                this.node.getChildByName("joystickBg").setPosition(localPosition);
                this.node.getChildByName("joystickBar").setPosition(localPosition);
            }

        }

    }

    private callbackTOUCH_MOVE(event) {

        if (this.node.getChildByName("joystickBar")){
            let UITC: UITransformComponent = this.node.getComponent(UITransformComponent);
            if (UITC) {
                let localPosition: Vec3 = new Vec3(), localPositionBg: Vec3 = new Vec3();
                let touch: Touch = event.touch;
                UITC.convertToNodeSpaceAR(new Vec3(touch.getUILocation().x, touch.getUILocation().y, 0), localPosition);
                let hitPosition = this._hitTest(new Vec2(localPosition.x, localPosition.y));
                if (hitPosition) {
                    this.node.getChildByName("joystickBar").setPosition(hitPosition.x, hitPosition.y, 0);
                    this.node.getChildByName("joystickBg").getPosition(localPositionBg);
                    this.dirChoose(new Vec2(localPosition.x, localPosition.y), new Vec2(localPositionBg.x, localPositionBg.y));
                }
            }

        }
    }



    private callbackTOUCH_END() {
        cc.log("joystickCtrl callbackTOUCH_END");
        this.initJoyStick();
        this.direction = Dir.STILL;
    }

    private callbackTOUCH_CANCEL() {
        cc.log("joystickCtrl callbackTOUCH_CANCEL");
        this.initJoyStick();
        this.direction = Dir.STILL;
    }

    //判断方向
    private dirChoose(touchPosition: Vec2, localPosition: Vec2) {

        let x = touchPosition.x - localPosition.x;
        let y = touchPosition.y - localPosition.y;

        if (Math.abs(x) > Math.abs(y)) {
            if (x > 0){
                this.direction = Dir.RIGHT;
            }
            else {
                this.direction = Dir.LEFT;
            }
        }
        else {
            if (y > 0){
                this.direction = Dir.UP;
            }
            else {
                this.direction = Dir.DOWN;
            }
        }

    }

    private _hitTest (cameraPt:Vec2): Vec2{
        let result;
        let node = this.node.getChildByName("joystickBg");

        if (node) {
            let nodePosition = node.getPosition();
            let nodePositionV2 = new Vec2(nodePosition.x, nodePosition.y);
            let size = node.getContentSize(),
                w = size.width;
            let rx = w / 2;
            let dis = this.getDistance(nodePositionV2, cameraPt);

            if (dis < rx) { //在园内
                result = cameraPt;
            } else {
                let intersectionPosition = this.getInsertPointBetweenCircleAndLine(nodePositionV2, cameraPt, rx);
                let sub = cameraPt.subtract(nodePositionV2);
                if (sub.x > 0){
                    result = intersectionPosition[0];
                }
                else {
                    result = intersectionPosition[1];
                }

            }
        }

        return result;
    }

    /**
     * 获取两点间的距离
     * @param p1 点1
     * @param p2 点2
     */
    private getDistance(p1: Vec2, p2: Vec2): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    /**
     * 获取直线和圆的交点
     * @param p1 圆心
     * @param p2 点2
     * @param r 半径
     */
    private getIntersection(p1: Vec2, p2: Vec2, r: number): Vec2 {
        let dis = this.getDistance(p1, p2);
        let x = (p2.x - p1.x) * r / dis;
        let y = (p2.y - p1.y) * r / dis;
        return new Vec2(x, y);
    }

    /**
     * 求圆和直线之间的交点
     * 直线方程：y = kx + b
     * 圆的方程：(x - m)² + (x - n)² = r²
     * x1, y1 = 线坐标1, x2, y2 = 线坐标2, m, n = 圆坐标, r = 半径
     */
    public getInsertPointBetweenCircleAndLine(p1: Vec2, p2: Vec2, r: number) {
        // console.log(x1, y1, x2, y2, m, n, r)
        let x1 = p1.x, y1 =  p1.y, x2 = p2.x, y2 =  p2.y, m = p1.x, n = p1.y;
        let kbArr = this.binaryEquationGetKB(x1, y1, x2, y2);
        let k = kbArr[0];
        let b = kbArr[1];

        let aX = 1 + k * k;
        let bX = 2 * k * (b - n) - 2 * m;
        let cX = m * m + (b - n) * (b - n) - r * r;

        let insertPoints = [];
        let xArr = this.quadEquationGetX(aX, bX, cX);
        xArr.forEach(x => {
            let y = k * x + b
            insertPoints.push({ x: x, y: y })
        })
        return insertPoints;
    }

    /**
     * 求二元一次方程的系数
     * y1 = k * x1 + b => k = (y1 - b) / x1
     * y2 = k * x2 + b => y2 = ((y1 - b) / x1) * x2 + b
     */
    private binaryEquationGetKB(x1, y1, x2, y2) {
        let k = (y1 - y2) / (x1 - x2);
        let b = (x1 * y2 - x2 * y1) / (x1 - x2);
        return [k, b];
    }


    /**
     * 一元二次方程求根
     * ax² + bx + c = 0
     */
    public quadEquationGetX(a, b, c) {
        let xArr = [];
        let result = Math.pow(b, 2) - 4 * a * c;
        if (result > 0) {
            xArr.push((-b + Math.sqrt(result)) / (2 * a));
            xArr.push((-b - Math.sqrt(result)) / (2 * a));
        } else if (result == 0) {
            xArr.push(-b / (2 * a));
        }
        return xArr;
    }

    onDestroy(){
        // 一般为了数据回收把控，我们会指定 func，并且在组件 destroy 的时候注销事件
        this.node.off(Node.EventType.TOUCH_START);
        this.node.off(Node.EventType.TOUCH_MOVE);
        this.node.off(Node.EventType.TOUCH_END);
        this.node.off(Node.EventType.TOUCH_CANCEL);
    }

    update (deltaTime: number) {
        // Your update function goes here.
        switch (this.direction) {
            case Dir.RIGHT:
                this.playerController.left({x:-this.speed}, );
                break;
            case Dir.LEFT:
                this.playerController.right({x:this.speed});
                break;
            case Dir.UP:
                this.playerController.up({z:this.speed});
                break;
            case Dir.DOWN:
                this.playerController.down({z:-this.speed});
                break;
        }
    }
}
