import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        const userExists1 = await User.findOne({ name });

        if(userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        if(userExists1) {
            res.status(400).json({ message: 'Username already exists' });
            return;
        }

        const tenantId = `${new Date().getTime()}_${Math.floor(Math.random()*100000)}`;
        const user = await User.create({ name, email, password, role: 'admin', tenantId });

        if(user){
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                token: generateToken(user),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin invites a member to their tenant
const inviteMember = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!req.tenantId || req.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, role: 'member', tenantId: req.tenantId });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error('Error inviting member:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { authUser, registerUser, inviteMember };