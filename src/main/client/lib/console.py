class Colours:
    RED = "\033[31m"
    CYAN = "\033[36m"
    ENDC = "\033[m"


def cyan(msg):
    return "{}{}{}".format(Colours.CYAN, msg, Colours.ENDC)


def error(msg):
    return "{}{}{}".format(Colours.RED, msg, Colours.ENDC)
