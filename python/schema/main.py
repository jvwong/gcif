from mongoengine import connect
from models import City


def main():
    connect('schema_test')

    print "OK"

    ### *** add a couple of Cities
    # toronto = City().save()


    ### *** query Posts
    # for post in Post.objects:
    #     print post.title


if __name__ == "__main__":
    main()