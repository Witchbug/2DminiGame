/// <reference path="../../typings/phaser.d.ts"/>
import Phaser, { Game } from 'phaser';
import StateMachine from 'javascript-state-machine';

class Hero extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        // over riding the Sprite to customize the game world and physics world  to run by spritesheet
        super(scene, x, y, 'hero-run-sheet', 0);

        // adding the scene to the game world and physics world 
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // showing the player running on the screen
        this.anims.play('hero-running');

        //setting the hero origin postion accordint to its own size 
        this.setOrigin(0.5, 1);
        // setting the collide boundery to stop falling down due to the gravity of physics 
        this.body.setCollideWorldBounds(true);

        //setting the character collision size
        this.body.setSize(12, 40);
        this.body.setOffset(12, 23);

        //setting the speed limit of running, falling and stopping
        this.body.setMaxVelocity(250, 400);
        this.body.setDragX(650);

        // keyboard input key extended from Game.js file 
        this.keys = scene.cursorKeys;
        this.input = {};

        // calling javascript state machine methods
        this.setupAnimations();
        this.setupMovement();
    }

    // Creating animation using javascript state machine
    setupAnimations() {
        this.animState = new StateMachine({
            init: 'idle',
            transitions: [
                { name: 'idle', from: ['falling', 'running', 'pivoting'], to: 'idle' },
                { name: 'run', from: ['falling', 'idle', 'pivoting'], to: 'running'},
                { name: 'pivot', from: ['falling', 'running'], to: 'pivoting'},
                { name: 'jump', from: ['idle', 'running', 'pivoting'], to: 'jumping'},
                { name: 'flip', from: ['jumping', 'falling'], to: 'flipping'},
                { name: 'fall', from: ['idle', 'running', 'pivoting', 'jumping', 'flipping'], to: 'falling'}, // '*' sign indicates that "all other state except falling state"
                { name: 'die', from: '*', to: 'dead' }
            ],
            methods: {
                onEnterState: (lifecycle) => {
                    this.anims.play('hero-' + lifecycle.to);
                    // console.log(lifecycle);   
                },
            }
        });

        //animation state execution condition 
        this.animPredicates = {
            idle: () => {
                return this.body.onFloor() && this.body.velocity.x === 0;
            },
            run: () => {
                return this.body.onFloor() && Math.sign(this.body.velocity.x) === (this.flipX ? -1 : 1); //checking if the Hero is Running according to facing direction. 
            },
            pivot: () => {
                return this.body.onFloor() && Math.sign(this.body.velocity.x) === (this.flipX ? 1 : -1); //checking if the Hero is Running according to opposite facing direction. 
            },
            jump: () => {
                return this.body.velocity.y < 0; // negetive value indicates that it is moving upward
            },
            flip: () => {
                return this.body.velocity.y < 0 && this.moveState.is('flipping');
            },
            fall: () => {
                return this.body.velocity.y > 0; // positive value indicates that it is moving downward
            }
        };
    }

    // Hero moving using javascript state machine 
    setupMovement() {
        this.moveState = new StateMachine({
            init: 'standing',
            transitions: [
                { name: 'jump', from: 'standing', to: 'jumping' },
                { name: 'flip', from: 'jumping', to: 'flipping' },
                { name: 'fall', from: 'standing', to: 'falling' },
                { name: 'touchdown', from: ['jumping', 'flipping', 'falling'], to: 'standing' },
                { name: 'die', from: ['jumping', 'flipping', 'falling', 'standing'], to: 'dead' }
            ],
            methods: {
                onJump: () => {
                    this.body.setVelocityY(-400);
                    this.emit('jumped');
                },
                onFlip: () => {
                    this.body.setVelocityY(-300);
                    this.emit('doubleJumped');
                },
                onDie: () => {
                    this.body.setVelocity(0, -500);
                    this.body.setAcceleration(0);
                }
            }
        });

        this.movePredicates = {
            jump: () => {
                return this.input.didPressJump;
            },
            flip: () => {
                return this.input.didPressJump;
            },
            fall: () => {
                return !this.body.onFloor();
            },
            touchdown: () => {
                return this.body.onFloor();
            }
        };

    }

    kill() {
        if(this.moveState.can('die')) {
            this.moveState.die();
            this.animState.die();
            this.emit('died'); //registaring event listener 
        }
    }

    isDead() {
        return this.moveState.is('dead');
    }

    // pre update method to update sprite animations for Hero movement
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // storing the input for double jump 
        this.input.didPressJump = !this.isDead() && Phaser.Input.Keyboard.JustDown(this.keys.up);

        // Condition for Hero Running 
        if(!this.isDead() && this.keys.left.isDown) {
            this.body.setAccelerationX(-1000);
            //while moving backward
            this.setFlipX(true);
            //setting the collision position of the pic as it runs backwards
            this.body.offset.x = 8;
        } else if (!this.isDead() && this.keys.right.isDown) {
            this.body.setAccelerationX(1000);
            // while moving forward
            this.setFlipX(false);
            //setting the collision position of the pic as it runs forward
            this.body.offset.x = 12;
        } else {
            this.body.setAccelerationX(0);
        }

        //single Jumping
        if(this.moveState.is('jumping') || this.moveState.is('flipping')) {
            if(!this.keys.up.isDown && this.body.velocity.y < -150) {
                this.body.setVelocityY(-150);
            }
        }
        

        // triggering the transition method according to the state for jumping and double jumping
        for (const t of this.moveState.transitions()) {     // transitions() method returns the name of the transiations declared inside setupMovement method  (for jump)
            if(t in this.movePredicates && this.movePredicates[t]()) {
                this.moveState[t]();
                break;
            }
        }

        // triggering the transition method according to the state for animation the Hero
        for (const t of this.animState.transitions()) {     // transitions() method returns the name of the transiations declared inside setupMovement method  (for jump)
            if(t in this.animPredicates && this.animPredicates[t]()) {
                this.animState[t]();
                break;
            }
        }
    }

}

export default Hero;