package com.lee.baiduvoicedemo;

import android.content.Context;
import android.os.Environment;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * @类名: ${type_name}
 * @功能描述:
 * @作者: ${user}
 * @时间: ${date}
 * @最后修改者:
 * @最后修改内容:
 */
public class CopyAssetsFile {

    /**
     *  从assets目录中复制整个文件夹内容  
     *  @param  context  Context 使用CopyFiles类的Activity 
     *  @param  oldPath  String  原文件路径  如：/aa  
     *  @param  newPath  String  复制后路径  如：xx:/bb/cc  
     */
    public void copyFilesFassets(Context context,String oldPath,String newPath) {
        try {
            String fileNames[] = context.getAssets().list(oldPath);//获取assets目录下的所有文件及目录名  
            if (fileNames.length > 0) {//如果是目录  
                File file = new File(newPath);
                file.mkdirs();//如果文件夹不存在，则递归  
                for (String fileName : fileNames) {
                    copyFilesFassets(context,oldPath + "/" + fileName, newPath+"/"+fileName);
                }
            } else {//如果是文件
                File file=new File(Environment.getExternalStorageDirectory().getAbsolutePath()+"/" + newPath);
                String  path = newPath.substring(0, newPath.lastIndexOf("/"));
                getDirectory(path);

                if(!file.exists()){
                    file.createNewFile();
                }
                InputStream is =  context.getClass().getClassLoader().getResourceAsStream(oldPath);
                FileOutputStream fos = new FileOutputStream(file);
                byte[] buffer = new byte[1024];
                int byteCount = 0;
                while((byteCount = is.read(buffer)) != -1) {//循环从输入流读取 buffer字节          
                    fos.write(buffer, 0, byteCount);//将读取的输入流写入到输出流  
                }
                fos.flush();//刷新缓冲区  
                is.close();
                fos.close();
            }
        } catch (Exception e) {
            // TODO Auto-generated catch block  
            e.printStackTrace();
            //如果捕捉到错误则通知UI线程  
        }
    }
    //分级建立文件夹
    public void getDirectory(String path){
        //对path进行处理，分层级建立文件夹
        String[]  s=path.split("/");
        String str=Environment.getExternalStorageDirectory().getAbsolutePath();
        for (int i = 0; i < s.length; i++) {
            str=str+"/"+s[i];
            File file=new File(str);
            if(!file.exists()){
                file.mkdir();
            }
        }

    }
}
//jhfghfh