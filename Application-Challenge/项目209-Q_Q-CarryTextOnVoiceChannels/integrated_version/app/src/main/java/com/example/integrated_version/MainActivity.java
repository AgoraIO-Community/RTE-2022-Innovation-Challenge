package com.example.integrated_version;

/*
	author by:2432655389@qq.com
	商业合作请联系author
	非商业化使用请标明出处
	内有百度地图和agora的sdk的授权ak
	短时间内试用还ok，时间长了估计免费额度就over了
	长时间请替换成自己的授权ak
*/

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import agora.agora_MainActivity;
import baiduMap.baiduMapMainActivity;

public class MainActivity extends AppCompatActivity {
    private Button mBtn_map;
    private Button mBtn_record;
    private Button mRtn_agora;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mBtn_map=(Button)findViewById(R.id.btn_map);
        mBtn_record=(Button)findViewById(R.id.btn_record);
        mRtn_agora=(Button)findViewById(R.id.btn_agora);
        setListeners();
    }

    private void setListeners() {
        Onclick onclick=new Onclick();
        mBtn_map.setOnClickListener(onclick);
        mBtn_record.setOnClickListener(onclick);
        mRtn_agora.setOnClickListener(onclick);

    }
    private class Onclick implements View.OnClickListener{
        @Override
        public void onClick(View v) {
            Intent intent=null;
            switch(v.getId()){
                case R.id.btn_record:
                    intent =new Intent(MainActivity.this, baiduMapMainActivity.class);
                    break;//这一行不能缺，不然默认都顺位到最后了
                case R.id.btn_map:
                    intent =new Intent(MainActivity.this, baiduMapMainActivity.class);
                    break;
                case R.id.btn_agora:
                    intent =new Intent(MainActivity.this, agora_MainActivity.class);
                    break;
            }
            startActivity(intent);
        }
    }
}