from mongoengine import connect
from models import User, Post, ImagePost, LinkPost, TextPost, Comment


def main():
    connect('tumblelog')

    ### *** add Users
    # jw = User(email='jvwong@outlook.com', first_name='Jeff', last_name='Wong').save()
    # ar = User(email='andreag@outlook.com', first_name='Andrea', last_name='Raymond').save()

    ### *** add Posts
    # p1 = TextPost(title='Fun with Mongoengine', author=jw)
    # p1.content = 'looks pretty cool'
    # p1.tags = ['mongodb', 'mongoengine']
    # p1.save()

    # p2 = LinkPost(title='Mongoengine docs', author=ar)
    # p2.link_url = 'http://www.google.com'
    # p2.tags = ['mongoengine']
    # p2.save()


    ### *** query Posts
    for post in Post.objects:
        print post.title


if __name__ == "__main__":
    main()