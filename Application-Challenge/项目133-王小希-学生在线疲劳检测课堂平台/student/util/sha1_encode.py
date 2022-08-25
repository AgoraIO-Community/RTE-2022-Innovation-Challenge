import hashlib

'''sha1加密'''
#参考 https://blog.csdn.net/weixin_43667990/article/details/88427640

def shaEncode(pwd):
    #创建sha1对象
    sha1 = hashlib.sha1()
    #对字符进行加密，默认支持字节串，字符串须先编码
    sha1.update(pwd.encode())

    #获取加密后的数据（字符串）
    res1 = sha1.hexdigest()
    # res1 = sha1.digest()  #这个返回的是字节
    # print(res1,type(res1))
    return res1

def sha1_equal(pwd,raw_pwd):
    '''
    :param pwd: 经过sha1编码的pwd
    :param raw_pwd: 经过sha1编码的pwd
    :return:
    '''
    if(pwd == shaEncode(raw_pwd)):
        return True
    else:
        return False

if __name__ == '__main__':
    pwd = '123'
    res1 = shaEncode(pwd)
    print(res1)
    print(sha1_equal(res1,"123"))

