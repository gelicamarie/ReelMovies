import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { shuffle } from 'lodash';

import { createToken, JWT_SECRET } from '../lib/auth';
import Models from '../models';

const router = Router();

// Getting all users
router.get('/', async (_, res, next) => {
  try {
    const users = await Models.User.find();
    return res.json(users);
  } catch (err) { return next(err); }
});

// Getting one user
router.get('/:userId', async ({ params: { userId } }, res, next) => {
  try {
    const user = await Models.User.findById(userId);
    if (user) return res.json(user);
    return next({ message: `${userId} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

// Post request to add user
router.post('/', async ({ body }, res, next) => {
  try {
    const hashMe = await bcrypt.hash(body.password, 12);
    const newUser = new Models.User({ ...body, password: hashMe });
    const saveUser = await newUser.save();

    const { username, role, _id: id } = saveUser;
    // Createing and Setting Tokens
    const tokens = {
      access: createToken(username, id, role, JWT_SECRET, '15min'),
      refresh: createToken(username, id, role, JWT_SECRET, '7d'),
    };

    res.cookie('access-token', tokens.access);
    res.cookie('refresh-token', tokens.refresh, { maxAge: 60 * 60 * 24 * 7 });

    return res.json(saveUser.toJSON());
  } catch (err) { return next(err); }
});

// Change user role
router.patch('/:userId/role', async ({ params: { userId } }, res, next) => {
  try {
    const user = await Models.User.findById(userId);
    if (user) {
      const role = user.role === 'contributing' ? 'regular' : 'contributing';

      const updatedUser = await Models.User.updateOne(
        { _id: userId }, { role }, (err, updated) => {
          if (err) return next(err);
          return updated;
        },
      );

      return res.json({ ...updatedUser, role });
    }
    return next({ message: `${userId} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

router.post('/login', async ({ body }, res, next) => {
  try {
    const { username } = body;

    if (!body.username || !body.password) return next({ message: 'Missing username or password field', status: 400 });

    // Grab user from DB
    const retrievedUser = await Models.User.findOne({ username });
    if (!retrievedUser) return next({ message: 'User does not exist', status: 404 });

    // Validate passwords
    const checkPassword = await bcrypt.compare(body.password, retrievedUser.password);
    if (!checkPassword) return next({ message: 'Incorrect password', status: 401 });

    const { _id: id, role } = retrievedUser;

     // Createing and Setting Tokens
    const tokens = {
      access: createToken(username, id, role, JWT_SECRET, '15min'),
      refresh: createToken(username, id, role, JWT_SECRET, '7d'),
    };

    res.cookie('access-token', tokens.access);
    res.cookie('refresh-token', tokens.refresh, { maxAge: 60 * 60 * 24 * 7 });

    return res.json({ ...retrievedUser.toJSON(), tokens });
  } catch (err) { return next(err); }
});

/**
 * Generate new set of tokens
 * Input: {tokens: {refresh: string, access: string}}
 */
router.post('/token/update', async ({ body }, res, next) => {
  if (!body.tokens) {
    return next({ message: 'Missing tokens', status: 403 });
  }

  const userId = jwt.verify(body.tokens.refresh, JWT_SECRET, (err, user) => {
    if (err) {
      return next({ message: 'Invalid refresh token', status: 403 });
    }
    return user.userId;
  });

  try {
    const user = await Models.User.findById(userId);

    if (user) {
      const { username, _id: id, role } = user;

      // Create tokens
      const tokens = {
        access: createToken(username, id, role, JWT_SECRET, '15min'),
        refresh: createToken(username, id, role, JWT_SECRET, '7d'),
      };

      // Set tokens
      res.cookie('access-token', tokens.access);
      res.cookie('refresh-token', tokens.refresh, { maxAge: 60 * 60 * 24 * 7 });

      return res.json({ ...user.toJSON(), tokens });
    }
    return next({ message: `${userId} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

// Follow a user
router.post('/follow/user/:userId', async ({ params: { userId }, body }, res, next) => {
  if (!body.userId) return next({ message: '`userId` is a required field.', status: 412 });

  try {
    const user = await Models.User.findById(userId);
    const followUser = await Models.User.findById(body.userId);

    if (user && followUser) {
      if (userId === body.userId) return next({ message: 'Self follow not allowed', status: 400 });

      const shouldFollow = await Models.User
        .findById({ _id: userId })
        .where('followingUser').ne(body.userId);

      if (!shouldFollow) return next({ message: `You are already following ${followUser.name.first}`, status: 400 });

      // add followUser to followingUser list for user
      await Models.User.findByIdAndUpdate(
        { _id: userId },
        { $push: { followingUser: body.userId } },
      );

      // add user to followers list of followUser
      await Models.User.findByIdAndUpdate(
        { _id: body.userId },
        { $push: { follower: userId } },
      );

      return res.json({ message: `${user.name.first} started following ${followUser.name.first}` });
    }

    return next({ message: 'Not a valid user id', status: 404 });
  } catch (err) { return next(err); }
});

// Follow a person (writer/actor/director)
router.post('/follow/person/:userId', async ({ params: { userId }, body }, res, next) => {
  if (!body.userId) {
    return next({ message: '`userId` is a required field.', status: 412 });
  }

  const personId = body.userId;

  try {
    const user = await Models.User.findById(userId);
    const followPerson = await Models.Person.findById(personId);
    if (user && followPerson) {
      const shouldNotFollow = await Models.User
        .findById({ _id: userId })
        .where('followingCrew').equals(personId);

      if (shouldNotFollow) return next({ message: `You are already following ${followPerson.name}`, status: 400 });

      await Models.User.findByIdAndUpdate(
        { _id: userId },
        { $push: { followingCrew: personId } },
      );

      await Models.Person.findByIdAndUpdate(
        { _id: personId },
        { $push: { follower: userId } },
      );

      return res.json({ message: `${user.name.first} started following ${followPerson.name}` });
    }

    return next({ message: 'Not a valid user or person id', status: 404 });
  } catch (err) { return next(err); }
});

// Unfollow a user
router.post('/unfollow/user/:userId', async ({ params: { userId }, body }, res, next) => {
  if (!body.userId) return next({ message: '`userId` is a required field.', status: 412 });

  try {
    const user = await Models.User.findById(userId);
    const followUser = await Models.User.findById(body.userId);

    if (user && followUser) {
      // make sure user is following followUser
      const shouldNotUnfollow = await Models.User
        .findById({ _id: userId })
        .where('followingUser').ne(body.userId);

      if (shouldNotUnfollow) return next({ message: `You are not following ${followUser.name.first}`, status: 400 });

      // remove followUser from followingUser list for user
      await Models.User.findByIdAndUpdate(
        { _id: userId },
        { $pullAll: { followingUser: [body.userId] } },
      );

      // remove user from followers list of followUser
      await Models.User.findByIdAndUpdate(
        { _id: body.userId },
        { $pullAll: { follower: [userId] } },
      );

      return res.json({ message: `${user.name.first} unfollowed ${followUser.name.first}` });
    }

    return next({ message: 'Not a valid user id', status: 404 });
  } catch (err) { return next(err); }
});

// Unfollow a person (writer/actor/director)
router.post('/unfollow/person/:userId', async ({ params: { userId }, body }, res, next) => {
  if (!body.userId) {
    return next({ message: '`userId` is a required field.', status: 412 });
  }

  const personId = body.userId;

  try {
    const user = await Models.User.findById(userId);
    const followPerson = await Models.Person.findById(personId);

    if (user && followPerson) {
      const shouldUnfollow = await Models.User
        .findById({ _id: userId })
        .where('followingCrew').equals(personId);

      if (!shouldUnfollow) {
        return next({ message: `You are not even following ${followPerson.name}`, status: 400 });
      }

      await Models.Person.findByIdAndUpdate(
        { _id: personId },
        { $pullAll: { follower: [userId] } },
      );

      await Models.User.findByIdAndUpdate(
        { _id: userId },
        { $pullAll: { followingCrew: [personId] } },
      );

      return res.json({ message: `${user.name.first} unfollowed ${followPerson.name}` });
    }

    return next({ message: 'Not a valid user or person id', status: 404 });
  } catch (err) { return next(err); }
});

// Get all the followers for a given user
router.get('/followers/:userId', async ({ params: { userId } }, res, next) => {
  try {
    const user = await Models.User.findById(userId)
      .select('follower name')
      .populate('follower');

    if (user) return res.json(user);
    return next({ message: `${userId} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

//  Get all the following for a given user
router.get('/following/:userId', async ({ params: { userId } }, res, next) => {
  try {
    const user = await Models.User.findById(userId)
      .select('followingUser followingCrew name')
      .populate('followingUser followingCrew');

    if (user) return res.json(user);
    return next({ message: `${userId} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

// Get reviews given by user
router.get('/review/:userId', async ({ params: { userId } }, res, next) => {
  try {
    const review = await Models.MovieReview.find({ user: userId }).populate('movie', 'title');

    if (review) {
      if (review.length >= 1) {
        return res.json(review.reverse());
      }
    }

    return next({ message: `Reviews by for ${userId} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

// Get notifications for given user
router.get('/notifications/:userId', async ({ params: { userId } }, res, next) => {
  try {
    const notifs = await Models.Notifications.find({ to: userId });

    if (notifs) {
      if (notifs.length >= 1) {
        return res.json(notifs);
      }
    }

    return next({ message: `Couldn't find notifications for ${userId}`, status: 404 });
  } catch (err) { return next(err); }
});

// Delete notification
router.delete('/notifications/read/:notifId', async ({ params: { notifId } }, res, next) => {
  try {
    const notifs = await Models.Notifications.findByIdAndDelete(notifId);
    if (notifs) {
      return res.json({ message: 'Marked as read' });
    }
    return next({ message: 'Couldn\'t find notification', status: 404 });
  } catch (err) { return next(err); }
});

// Recommended movies for given user
router.get('/recommendation/:userId', async ({ params: { userId } }, res, next) => {
  try {
    const user = await Models.User.findById(userId);
    // add liked movies to a set
    const moviesSet = new Set();

    if (user) {
      user.likes.map((a) => moviesSet.add(a.toString()));

      // grab all crew movies
      await Promise.all(
        user.followingCrew.map((id) => Models.Person.findById(id)),
      ).then((crew) => {
        crew.forEach((m) => {
          m.director.map((movie) => moviesSet.add(movie.toString()));
          m.actor.map((movie) => moviesSet.add(movie.toString()));
          m.writer.map((movie) => moviesSet.add(movie.toString()));
        });
      });

      await Promise.all(
        user.followingUser.map((id) => Models.User.findById(id)),
      ).then((u) => {
        u.forEach((m) => {
          // add all movies liked by ppl they follow
          m.likes.map((movie) => moviesSet.add(movie.toString()));
          // add all movies hated by ppl they follow
          m.dislikes.map((movie) => moviesSet.delete(movie.toString()));
        });
      });

      // removed all disliked movies
      user.dislikes.map((a) => moviesSet.delete(a.toString()));

      // shuffle the array and grab first 20 movies
      const movies = await Promise.all(shuffle([...moviesSet])
        .slice(0, 20)
        .map((m) => Models.Movie.findById(m).populate('directors', 'name')));

      return res.json(movies);
    }

    return next({ message: `${userId} does not exist`, status: 404 });
  } catch (err) { return next(err); }
});

export default router;
