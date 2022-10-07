// le package bcrypt permet le chiffrement et le hashage des mots de passe à stocker dans la base de données
// le package jsonwebtoken permet de créer et de vérifier des tokens d'authentification afin qu'un utilisateur
// n'utilise qu'une seule session de connexion et soit authentifié pour chacune de ses requêtes durant cette
// session

const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// fonction utilisée pour la requête d'inscription d'un utilisateur
exports.signup = (req, res, next) => {
  const ruleMail = /^[a-z0-9._-]{2,30}[@][a-z0-9_-]{2,20}[.][a-z]{2,15}$/;
  const rulePass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (ruleMail.test(req.body.email) && rulePass.test(req.body.password)) {
    bcrypt.hash(req.body.password, 10).then(hash => {
      const user = new User({email: req.body.email, password: hash});
      user.save().then(() => res.status(201).json({message: "Utilisateur créé !"})).catch(error => res.status(400).json({error}));
    }).catch(error => res.status(500).json({error}));
  } else {
    if (rulePass.test(req.body.password)) {
      return res.status(401).json({error: "Email incorrect !"});
    } else {
      return res.status(401).json({error: "Password incorrect !"});
    }
  }
};

// fonction utilisée pour la requête de connexion d'un utilisateur
exports.login = (req, res, next) => {
  const ruleMail = /^[a-z0-9._-]{2,30}[@][a-z0-9_-]{2,20}[.][a-z]{2,15}$/;
  const rulePass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (ruleMail.test(req.body.email) && rulePass.test(req.body.password)) {
    User.findOne({email: req.body.email}).then(user => {
      if (!user) {
        return res.status(401).json({error: "Utilisateur non trouvé !"});
      }
      bcrypt.compare(req.body.password, user.password).then(valid => {
        if (!valid) {
          return res.status(401).json({error: "Mot de passe incorrect !"});
        }
        res.status(200).json({
          userId: user._id,
          token: jwt.sign({
            userId: user._id
          }, "u0JxYwok4U-Jn0`=(-69T5E=m!MkJ6", {expiresIn: "24h"})
        });
      }).catch(error => res.status(500).json({error}));
    }).catch(error => res.status(500).json({error}));
  } else {
    if (rulePass.test(req.body.password)) {
      return res.status(401).json({error: "Email incorrect !"});
    } else {
      return res.status(401).json({error: "Password incorrect !"});
    }
  }
};