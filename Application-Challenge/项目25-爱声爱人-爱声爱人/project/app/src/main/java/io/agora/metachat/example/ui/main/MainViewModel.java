package io.agora.metachat.example.ui.main;

import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import java.util.Arrays;
import java.util.List;

import io.agora.metachat.IMetachatEventHandler;
import io.agora.metachat.MetachatSceneInfo;
import io.agora.metachat.MetachatUserAvatarConfig;
import io.agora.metachat.example.MainApplication;
import io.agora.metachat.example.MetaChatContext;

public class MainViewModel extends ViewModel implements IMetachatEventHandler {

    private final MutableLiveData<String> avatar = new MutableLiveData<>();
    private final MutableLiveData<String> nickname = new MutableLiveData<>();
    private final MutableLiveData<String> sex = new MutableLiveData<>();
    private final MutableLiveData<List<MetachatSceneInfo>> sceneList = new MutableLiveData<>();
    private final MutableLiveData<MetachatSceneInfo> selectScene = new MutableLiveData<>();
    private final MutableLiveData<Boolean> requestDownloading = new MutableLiveData<>();
    private final MutableLiveData<Integer> downloadingProgress = new MutableLiveData<>();

    @Override
    protected void onCleared() {
        MetaChatContext.getInstance().unregisterMetaChatEventHandler(this);
        super.onCleared();
    }

    public LiveData<String> getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar.postValue(avatar);
    }

    public LiveData<String> getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname.postValue(nickname);
    }

    public LiveData<String> getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex.postValue(sex);
    }

    public LiveData<List<MetachatSceneInfo>> getSceneList() {
        return sceneList;
    }

    public LiveData<MetachatSceneInfo> getSelectScene() {
        return selectScene;
    }

    public LiveData<Boolean> getRequestDownloading() {
        return requestDownloading;
    }

    public LiveData<Integer> getDownloadingProgress() {
        return downloadingProgress;
    }

    public void getScenes(String rtctk,String rtmtk) {
        MetaChatContext metaChatContext = MetaChatContext.getInstance();
        metaChatContext.registerMetaChatEventHandler(this);
        boolean flag = metaChatContext.initialize(
                MainApplication.instance,
                nickname.getValue(),
                avatar.getValue(),
                rtctk,
                rtmtk

        );
        if (flag) {
            metaChatContext.getScenes();
        }
    }

    public void prepareScene(MetachatSceneInfo sceneInfo) {
        MetaChatContext metaChatContext = MetaChatContext.getInstance();

        metaChatContext.prepareScene(sceneInfo, new MetachatUserAvatarConfig() {{
            // TODO choose one
            mAvatarCode = sceneInfo.mAvatars[0].mAvatarCode;
            mLocalVisible = true;
            mRemoteVisible = true;
            mSyncPosition = true;
        }});
        if (metaChatContext.isSceneDownloaded(sceneInfo)) {
            selectScene.postValue(sceneInfo);
        } else {
            requestDownloading.postValue(true);
        }
    }

    public void downloadScene(MetachatSceneInfo sceneInfo) {
        MetaChatContext.getInstance().downloadScene(sceneInfo);
    }

    public void cancelDownloadScene(MetachatSceneInfo sceneInfo) {
        MetaChatContext.getInstance().cancelDownloadScene(sceneInfo);
    }

    @Override
    public void onConnectionStateChanged(int state, int reason) {

    }

    @Override
    public void onRequestToken() {

    }

    @Override
    public void onGetScenesResult(MetachatSceneInfo[] scenes, int errorCode) {
        Log.e("Scenes  @@@@@@@@@@@@  ", String.valueOf(Arrays.asList(scenes).size()));
        Log.e("Scenes  @@@@@@@@@@@@  ", String.valueOf(Arrays.asList(scenes).size()));
        Log.e("Scenes  @@@@@@@@@@@@  ", String.valueOf(Arrays.asList(scenes).size()));
        Log.e("Scenes  @@@@@@@@@@@@  ", String.valueOf(Arrays.asList(scenes).size()));
        sceneList.postValue(Arrays.asList(scenes));
    }

    @Override
    public void onDownloadSceneProgress(MetachatSceneInfo sceneInfo, int progress, int state) {
        Log.d("progress", String.valueOf(progress));
        if(state == 3){
            downloadingProgress.postValue(-1);
            return;
        }
        downloadingProgress.postValue(progress);
        if (state == 2) {
            selectScene.postValue(sceneInfo);
        }
    }

}
