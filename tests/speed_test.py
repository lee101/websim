import unittest
import requests


class SpeedTest(unittest.TestCase):

    def test_speed(self):
        for x in xrange(100):
            r = requests.get('http://localhost:8080/cats-d8c4vu/localhost:8080')



if __name__ == '__main__':
    unittest.main()
