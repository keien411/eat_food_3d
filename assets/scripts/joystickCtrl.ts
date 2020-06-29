import {
    _decorator,
    Component,
    Node,
    RigidBodyComponent,
    Vec3,
    SpriteComponent,
    Color,
    Vec2,
    Mat4,
    UITransformComponent,
    Touch
} from 'cc';
import {mangeGame} from "./mange/mangeGame";
import {player} from './player';

const {ccclass, property, type} = _decorator;

enum Dir {//0:静止，1：上，2：下，3：左，4：右，5上左，6上右，7下左，8下右,9任意
    STILL,
    UP,
    DOWN,
    LEFT,
    RIGHT,
    UPLEFT,
    UPRIGHT,
    DOWNLEFT,
    DOWNRIGHT,
    ALL,
}

enum State {//模式0：4键，1：8键，2：任意
    FOUR,
    EIGHT,
    ALL,
}

@ccclass('joystickCtrl')
export class joystickCtrl extends mangeGame {

    @property(player)
    private playerController: player = null;

    @property
    private state: number = State.FOUR;

    private direction: number = Dir.STILL;
    private angel: number = 0;//旋转角度
    private movePos: Vec2 = new Vec2(1, 1);//移动的距离

    start() {
        //添加监听事件
        this.node.on(Node.EventType.TOUCH_START, this.callbackTOUCH_START, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.callbackTOUCH_MOVE, this);
        this.node.on(Node.EventType.TOUCH_END, this.callbackTOUCH_END, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.callbackTOUCH_CANCEL, this);
    }

    onLoad() {
        cc.log("joystickCtrl onLoad");
        this.initJoyStick();
    }

    /**
     * 初始化操纵杆位置
     * 操纵点始终在中心处
     */
    private initJoyStick() {

        if (this.node.getChildByName("joystickBg") && this.node.getChildByName("joystickBar")) {
            this.node.getChildByName("joystickBg").getComponent(SpriteComponent).color = new Color().fromHEX("#FFFFFF8C");//透明50%
            this.node.getChildByName("joystickBar").getComponent(SpriteComponent).color = new Color().fromHEX("#FFFFFF8C");//透明50%
            this.node.getChildByName("joystickBar").setPosition(this.node.getChildByName("joystickBg").getPosition());//设置操纵点始终在中心处
        }

    }

    /**
     * 触摸开始事件
     */
    private callbackTOUCH_START(event) {
        if (this.node.getChildByName("joystickBg") && this.node.getChildByName("joystickBar")) {
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

    /**
     * 触摸移动事件
     */
    private callbackTOUCH_MOVE(event) {

        if (this.node.getChildByName("joystickBar")) {
            let UITC: UITransformComponent = this.node.getComponent(UITransformComponent);
            if (UITC) {
                let localPosition: Vec3 = new Vec3(), localPositionBg: Vec3 = new Vec3();
                let touch: Touch = event.touch;
                UITC.convertToNodeSpaceAR(new Vec3(touch.getUILocation().x, touch.getUILocation().y, 0), localPosition);
                let hitPosition = this._hitTest(new Vec2(localPosition.x, localPosition.y));//获取操纵点的位置
                if (hitPosition) {
                    this.node.getChildByName("joystickBar").setPosition(hitPosition.x, hitPosition.y, 0);//设置操纵点的位置
                    this.node.getChildByName("joystickBg").getPosition(localPositionBg);
                    this.dirChoose(new Vec2(localPosition.x, localPosition.y), new Vec2(localPositionBg.x, localPositionBg.y));
                }
            }

        }
    }


    /**
     * 触摸结束事件
     */
    private callbackTOUCH_END() {
        this.initJoyStick();
        this.direction = Dir.STILL;
    }

    /**
     * 触摸取消事件
     */
    private callbackTOUCH_CANCEL() {
        this.initJoyStick();
        this.direction = Dir.STILL;
    }

    /**
     * 判断触摸点方向
     * @param touchPosition:触摸点移动的位置
     * @param localPosition:操纵杆中心的位置
     */
    private dirChoose(touchPosition: Vec2, localPosition: Vec2) {

        let x = touchPosition.x - localPosition.x;
        let y = touchPosition.y - localPosition.y;
        let newPoint = this.getTanPoint(localPosition, touchPosition);


        switch (this.state) {
            case State.FOUR:
                this.setDirFour(x, y);
                break;
            case State.EIGHT:
                this.setDirEight(newPoint.x, newPoint.y);
                break;
            case State.ALL:
                this.setDirAll(newPoint.x, newPoint.y);
                break;
        }


    }


    /**
     * 设置4键方向
     * @param x:x轴上的位移
     * @param y:y轴上的位移
     */
    private setDirFour(x: number, y: number) {
        if (Math.abs(x) > Math.abs(y)) {
            if (x > 0) {
                this.direction = Dir.RIGHT;
            } else {
                this.direction = Dir.LEFT;
            }
        } else {
            if (y > 0) {
                this.direction = Dir.UP;
            } else {
                this.direction = Dir.DOWN;
            }
        }
    }

    /**
     * 设置8键方向
     * @param x:x轴上的位移
     * @param y:y轴上的位移
     *
     */
    private setDirEight(x: number, y: number) {
        let radian = Math.atan2(y, x);
        //angel: +x:0 +y:90 -x:(180||-180) -y:-90
        let angel = this.getAngleByRadian(radian);

        if (angel >= -22.5 && angel < 22.5) {
            this.direction = Dir.RIGHT;
        } else if (angel >= 22.5 && angel < 67.5) {
            this.direction = Dir.UPRIGHT;
        } else if (angel >= 67.5 && angel < 112.5) {
            this.direction = Dir.UP;
        } else if (angel >= 112.5 && angel < 157.5) {
            this.direction = Dir.UPLEFT;
        } else if ((angel >= 157.5 && angel <= 180) || (angel >= -180 && angel < -157.5)) {//特殊处理临界点
            this.direction = Dir.LEFT;
        } else if (angel >= -157.5 && angel < -112.5) {
            this.direction = Dir.DOWNLEFT;
        } else if (angel >= -112.5 && angel < -67.5) {
            this.direction = Dir.DOWN;
        } else if (angel >= -67.5 && angel < -22.5) {
            this.direction = Dir.DOWNRIGHT;
        }
    }

    /**
     * 设置任意方向
     * @param x:x轴上的位移
     * @param y:y轴上的位移
     *
     */
    private setDirAll(x: number, y: number) {
        let radian = Math.atan2(y, x);
        let angelLocal = this.getAngleByRadian(radian);

        //angelLocal: +x:0 +y:90 -x:(180||-180) -y:-90

        if (angelLocal >= -90 && angelLocal <= 180) {//坐标转化
            this.angel = angelLocal + 90;
        } else if (angelLocal >= -180 && angelLocal < -90) {
            this.angel = angelLocal + 450;
        }

        //angel: +x:90 +y:180 -x:270 -y:360


        this.movePos = new Vec2(Math.sin(Math.PI/180*this.angel),
            Math.cos(Math.PI/180*this.angel));

        this.direction = Dir.ALL;
    }


    /**
     * 判断触摸点是在操控杆的园内，返回操纵点的最后位置
     * @param cameraPt:触摸点移动的位置
     */
    private _hitTest(cameraPt: Vec2): Vec2 {
        let result;
        let node = this.node.getChildByName("joystickBg");

        if (node) {
            let nodePosition = node.getPosition();
            let nodePositionV2 = new Vec2(nodePosition.x, nodePosition.y);
            let size = node.getContentSize(),
                w = size.width;
            let rx = w / 2;
            let dis = this.getDistance(nodePositionV2, cameraPt);//获取两点之间的距离，判断是否在园内

            if (dis < rx) { //在园内
                result = cameraPt;
            } else {
                let intersectionPosition = this.getInsertPointBetweenCircleAndLine(nodePositionV2, cameraPt, rx);//获取到圆外的点和圆之间的交点
                let sub = cameraPt.subtract(nodePositionV2);
                if (sub.x > 0) {
                    result = intersectionPosition[0];
                } else {
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
     * 求圆和直线之间的交点
     * 直线方程：y = kx + b
     * 圆的方程：(x - m)² + (x - n)² = r²
     * x1, y1 = 线坐标1, x2, y2 = 线坐标2, m, n = 圆坐标, r = 半径
     */
    public getInsertPointBetweenCircleAndLine(p1: Vec2, p2: Vec2, r: number) {
        // console.log(x1, y1, x2, y2, m, n, r)
        let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, m = p1.x, n = p1.y;
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
            insertPoints.push({x: x, y: y})
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

    /**
     * 角度 = 弧度 * 180 / Math.PI;
     * @param radian 弧度
     */
    public getAngleByRadian(radian: number): number {
        return radian * 180 / Math.PI;
    }

    /**
     * 两点，返回第二个点以第一个点为原点的坐标
     * @param point1 点
     */
    public getTanPoint(point1: Vec2, point2: Vec2): Vec2 {
        let newPoint = point2.subtract(point1);
        return newPoint;
    }

    onDestroy() {
        // 一般为了数据回收把控，我们会指定 func，并且在组件 destroy 的时候注销事件
        this.node.off(Node.EventType.TOUCH_START);
        this.node.off(Node.EventType.TOUCH_MOVE);
        this.node.off(Node.EventType.TOUCH_END);
        this.node.off(Node.EventType.TOUCH_CANCEL);
    }

    update(deltaTime: number) {
        // Your update function goes here.
        switch (this.direction) {
            case Dir.RIGHT:
                this.playerController.right({x: -1});
                break;
            case Dir.LEFT:
                this.playerController.left({x: 1});
                break;
            case Dir.UP:
                this.playerController.up({z: 1});
                break;
            case Dir.DOWN:
                this.playerController.down({z: -1});
                break;
            case Dir.UPRIGHT:
                this.playerController.up_right({x: -1, z: 1});
                break
            case Dir.UPLEFT:
                this.playerController.up_left({x: 1, z: 1});
                break
            case Dir.DOWNRIGHT:
                this.playerController.down_right({x: -1, z: -1});
                break
            case Dir.DOWNLEFT:
                this.playerController.down_left({x: 1, z: -1});
                break
            case Dir.ALL:
                this.playerController.allDir(this.angel, {x: -this.movePos.x, z: -this.movePos.y});
                break
        }
    }
}
