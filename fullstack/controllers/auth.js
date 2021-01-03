const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const keys = require('../config/keys');
const errorHandler = require('../utils/errorHandler');

module.exports.login = async function (req, res){
    // res.status(200).json({
    //     login: {
    //         email: req.body.email,
    //         password:  req.body.password
    //     }
    // })

    // find user
    const candidate = await User.findOne({email: req.body.email})

    if(candidate){
        //check password- user exists
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);
        if(passwordResult){
            //gen JWT

            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, {expiresIn: 60 * 60});

            res.status(200).json({
                token: `Bearer ${token}`
            });
        } else {
            res.status(401).json({
                message: 'Неверный пароль.'
            });
        }
    } else {
        // error user not exists
        res.status(404).json({
            message: 'Пользователь с таким email не найден.'
        });
    }

}

module.exports.register = async function (req, res){
    // res.status(200).json({
    //     register: 'from controller'
    // })

    //email password

    // const user = new User({
    //     email: req.body.email,
    //     password: req.body.password
    // })
    //
    // user.save().then(()=>console.log('user created'));

    const candidate = await User.findOne({email: req.body.email});

    if(candidate){
        //user exists, error needs
        res.status(409).json(({
            message: 'Данный  email занят.'
        }));
    } else {
        //create user
        const salt = bcrypt.genSaltSync(10);
        const password = req.body.password;
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        });

        try {
            await user.save();
            res.status(201).json(user);//to client
        } catch (e){
            // error
            errorHandler(res, e);
        }

    }
}










